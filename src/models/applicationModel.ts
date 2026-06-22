import db from '../config/db';
import type {
  ApplicationRow,
  ApplicationStatus,
  ApplicationWithPropertyInfoRow,
  ApplicationWithPropertyRow,
  ApplicationWithTenantInfoRow,
} from '../types/models';
import type { PaginatedResult } from './propertyModel';
import { extractCount } from '../utils/count';

const TABLE = 'rental_applications';

export interface CreateApplicationData {
  property_id: number;
  tenant_id: number;
  message?: string | null;
  status: ApplicationStatus;
}

export interface PageOptions {
  limit?: number;
  offset?: number;
}

export interface ApproveApplicationResult {
  approvedApplication: ApplicationRow;
  rejectedApplicationIds: number[];
}

const RentalApplicationModel = {
  async create(applicationData: CreateApplicationData): Promise<ApplicationRow> {
    const [application] = await db<ApplicationRow>(TABLE).insert(applicationData).returning('*');
    return application as ApplicationRow;
  },

  async findById(id: number): Promise<ApplicationRow | undefined> {
    return db<ApplicationRow>(TABLE).where({ id }).first();
  },

  
  async findByIdWithProperty(id: number): Promise<ApplicationWithPropertyRow | undefined> {
    return db(TABLE)
      .join('properties', 'rental_applications.property_id', 'properties.id')
      .where('rental_applications.id', id)
      .select(
        'rental_applications.*',
        'properties.landlord_id as property_landlord_id',
        'properties.status as property_status',
        'properties.title as property_title'
      )
      .first<ApplicationWithPropertyRow | undefined>();
  },

  async existsForTenantAndProperty(tenantId: number, propertyId: number): Promise<boolean> {
    const row = await db<ApplicationRow>(TABLE)
      .where({ tenant_id: tenantId, property_id: propertyId })
      .first('id');
    return !!row;
  },

  async findByTenant(
    tenantId: number,
    { limit, offset }: PageOptions = {}
  ): Promise<PaginatedResult<ApplicationWithPropertyInfoRow>> {
    const baseQuery = db(TABLE)
      .join('properties', 'rental_applications.property_id', 'properties.id')
      .where('rental_applications.tenant_id', tenantId);

    const totalItems = extractCount(
      await baseQuery.clone().count<{ count: string }[]>('rental_applications.id as count')
    );

    const query = baseQuery
      .clone()
      .select(
        'rental_applications.*',
        'properties.title as property_title',
        'properties.address as property_address',
        'properties.rent_amount as property_rent_amount'
      )
      .orderBy('rental_applications.created_at', 'desc');

    if (limit !== undefined) query.limit(limit);
    if (offset !== undefined) query.offset(offset);

    const items: ApplicationWithPropertyInfoRow[] = await query;
    return { items, totalItems };
  },

  async findByProperty(
    propertyId: number,
    { limit, offset }: PageOptions = {}
  ): Promise<PaginatedResult<ApplicationWithTenantInfoRow>> {
    const baseQuery = db(TABLE)
      .join('users', 'rental_applications.tenant_id', 'users.id')
      .where('rental_applications.property_id', propertyId);

    const totalItems = extractCount(
      await baseQuery.clone().count<{ count: string }[]>('rental_applications.id as count')
    );

    const query = baseQuery
      .clone()
      .select('rental_applications.*', 'users.name as tenant_name', 'users.email as tenant_email')
      .orderBy('rental_applications.created_at', 'desc');

    if (limit !== undefined) query.limit(limit);
    if (offset !== undefined) query.offset(offset);

    const items: ApplicationWithTenantInfoRow[] = await query;
    return { items, totalItems };
  },

  async countByTenantAndStatus(tenantId: number, status?: ApplicationStatus): Promise<number> {
    const query = db<ApplicationRow>(TABLE).where({ tenant_id: tenantId });
    if (status) query.andWhere({ status });
    return extractCount(await query.count<{ count: string }[]>('id as count'));
  },

  async countByLandlord(landlordId: number): Promise<number> {
    return extractCount(
      await db(TABLE)
        .join('properties', 'rental_applications.property_id', 'properties.id')
        .where('properties.landlord_id', landlordId)
        .count<{ count: string }[]>('rental_applications.id as count')
    );
  },

  /**
   * Atomically approves an application:
   *  1. Sets the target application to 'approved'
   *  2. Sets the property status to 'rented'
   *  3. Rejects all other pending applications for the same property
   *
   * Runs entirely inside a single DB transaction. If anything fails,
   * all changes are rolled back.
   */
  async approveApplicationTransaction(
    applicationId: number,
    propertyId: number
  ): Promise<ApproveApplicationResult> {
    return db.transaction(async (trx) => {
      const [approvedApplication] = await trx<ApplicationRow>(TABLE)
        .where({ id: applicationId })
        .update({ status: 'approved', updated_at: trx.fn.now() })
        .returning('*');

      await trx('properties')
        .where({ id: propertyId })
        .update({ status: 'rented', updated_at: trx.fn.now() });

      const rejectedApplications = await trx<ApplicationRow>(TABLE)
        .where({ property_id: propertyId, status: 'pending' })
        .andWhereNot({ id: applicationId })
        .update({ status: 'rejected', updated_at: trx.fn.now() })
        .returning('id');

      const rejectedApplicationIds = rejectedApplications.map((row) => row.id);

      return { approvedApplication: approvedApplication as ApplicationRow, rejectedApplicationIds };
    });
  },

  async rejectApplication(applicationId: number): Promise<ApplicationRow> {
    const [application] = await db<ApplicationRow>(TABLE)
      .where({ id: applicationId })
      .update({ status: 'rejected', updated_at: db.fn.now() })
      .returning('*');
    return application as ApplicationRow;
  },
};

export default RentalApplicationModel;
