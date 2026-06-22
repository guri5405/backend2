import db from '../config/db';
import ApplicationModel from '../models/applicationModel';
import PropertyModel from '../models/propertyModel';
import NotificationModel from '../models/notificationModel';
import { ApiError } from '../utils/ApiError';
import { buildPaginationMeta, getPagination } from '../utils/pagination';
import type {
  ApplicationRow,
  ApplicationWithPropertyInfoRow,
  ApplicationWithPropertyRow,
  ApplicationWithTenantInfoRow,
} from '../types/models';
import type { ApplyToPropertyInput } from '../types/dto';
import type { RawQuery } from '../types/pagination';
import type { ListResult } from './propertyService';

const ApplicationService = {
  /**
   * Tenant applies to a property.
   * Business rules enforced:
   *  - Cannot apply to a non-existent property
   *  - Can only apply to properties with status 'active' (i.e. cannot apply to rented properties)
   *  - Cannot apply twice to the same property
   */
  async apply(
    tenantId: number,
    propertyId: number,
    { message }: ApplyToPropertyInput
  ): Promise<ApplicationRow> {
    const property = await PropertyModel.findById(propertyId);
    if (!property) {
      throw ApiError.notFound('Property not found', 'PROPERTY_NOT_FOUND');
    }

    if (property.status !== 'active') {
      throw ApiError.badRequest(
        'This property is not currently accepting applications',
        'PROPERTY_NOT_ACTIVE'
      );
    }

    const alreadyApplied = await ApplicationModel.existsForTenantAndProperty(tenantId, propertyId);
    if (alreadyApplied) {
      throw ApiError.conflict('You have already applied to this property', 'DUPLICATE_APPLICATION');
    }

    const application = await db.transaction(async (trx) => {
      const [createdApplication] = await trx<ApplicationRow>('rental_applications')
        .insert({
          property_id: propertyId,
          tenant_id: tenantId,
          message: message || null,
          status: 'pending',
        })
        .returning('*');

      await NotificationModel.create(
        {
          user_id: property.landlord_id,
          title: 'New Rental Application',
          message: `New rental application received for "${property.title}".`,
        },
        trx
      );

      return createdApplication as ApplicationRow;
    });

    return application;
  },

  async getMyApplications(
    tenantId: number,
    query: RawQuery
  ): Promise<ListResult<ApplicationWithPropertyInfoRow>> {
    const { page, limit, offset } = getPagination(query);
    const { items, totalItems } = await ApplicationModel.findByTenant(tenantId, { limit, offset });
    return { items, pagination: buildPaginationMeta(totalItems, page, limit) };
  },

  /**
   * Landlord views applications for one of their own properties.
   */
  async getApplicationsForProperty(
    propertyId: number,
    landlordId: number,
    query: RawQuery
  ): Promise<ListResult<ApplicationWithTenantInfoRow>> {
    const property = await PropertyModel.findByIdAndLandlord(propertyId, landlordId);
    if (!property) {
      throw ApiError.notFound(
        'Property not found or you do not have permission to view its applications',
        'PROPERTY_NOT_FOUND'
      );
    }

    const { page, limit, offset } = getPagination(query);
    const { items, totalItems } = await ApplicationModel.findByProperty(propertyId, { limit, offset });
    return { items, pagination: buildPaginationMeta(totalItems, page, limit) };
  },

  /**
   * Loads an application and verifies that the requesting landlord owns the
   * underlying property. Throws 404 if either the application doesn't exist
   * or the landlord doesn't own the property (we don't leak existence).
   */
  async _getOwnedApplicationOrFail(
    applicationId: number,
    landlordId: number
  ): Promise<ApplicationWithPropertyRow> {
    const application = await ApplicationModel.findByIdWithProperty(applicationId);
    if (!application || application.property_landlord_id !== landlordId) {
      throw ApiError.notFound('Application not found', 'APPLICATION_NOT_FOUND');
    }
    return application;
  },

  /**
   * Approves an application. Atomically, in a single DB transaction:
   *  1. Application status -> approved
   *  2. Property status -> rented
   *  3. All other pending applications for that property -> rejected
   *  4. Notifications created for the approved tenant and every rejected tenant
   */
  async approve(applicationId: number, landlordId: number): Promise<ApplicationRow> {
    const application = await this._getOwnedApplicationOrFail(applicationId, landlordId);

    if (application.status !== 'pending') {
      throw ApiError.badRequest(
        `Cannot approve an application with status '${application.status}'`,
        'INVALID_APPLICATION_STATE'
      );
    }

    if (application.property_status !== 'active') {
      throw ApiError.badRequest(
        'This property is no longer active and cannot accept approvals',
        'PROPERTY_NOT_ACTIVE'
      );
    }

    const result = await db.transaction(async (trx) => {
      const [approvedApplication] = await trx<ApplicationRow>('rental_applications')
        .where({ id: applicationId })
        .update({ status: 'approved', updated_at: trx.fn.now() })
        .returning('*');

      await trx('properties')
        .where({ id: application.property_id })
        .update({ status: 'rented', updated_at: trx.fn.now() });

      const rejectedRows = await trx<ApplicationRow>('rental_applications')
        .where({ property_id: application.property_id, status: 'pending' })
        .andWhereNot({ id: applicationId })
        .update({ status: 'rejected', updated_at: trx.fn.now() })
        .returning(['id', 'tenant_id']);

      const notifications = [
        {
          user_id: (approvedApplication as ApplicationRow).tenant_id,
          title: 'Application Approved',
          message: `Your rental application for "${application.property_title}" has been approved.`,
        },
        ...rejectedRows.map((row) => ({
          user_id: row.tenant_id,
          title: 'Application Rejected',
          message: `Your rental application for "${application.property_title}" has been rejected.`,
        })),
      ];

      await NotificationModel.createMany(notifications, trx);

      return { approvedApplication: approvedApplication as ApplicationRow, rejectedCount: rejectedRows.length };
    });

    return result.approvedApplication;
  },

  /**
   * Rejects a single pending application (does not affect the property or
   * other applications).
   */
  async reject(applicationId: number, landlordId: number): Promise<ApplicationRow> {
    const application = await this._getOwnedApplicationOrFail(applicationId, landlordId);

    if (application.status !== 'pending') {
      throw ApiError.badRequest(
        `Cannot reject an application with status '${application.status}'`,
        'INVALID_APPLICATION_STATE'
      );
    }

    const result = await db.transaction(async (trx) => {
      const [rejectedApplication] = await trx<ApplicationRow>('rental_applications')
        .where({ id: applicationId })
        .update({ status: 'rejected', updated_at: trx.fn.now() })
        .returning('*');

      const rejected = rejectedApplication as ApplicationRow;

      await NotificationModel.create(
        {
          user_id: rejected.tenant_id,
          title: 'Application Rejected',
          message: `Your rental application for "${application.property_title}" has been rejected.`,
        },
        trx
      );

      return rejected;
    });

    return result;
  },
};

export default ApplicationService;
