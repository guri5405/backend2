import type { ApplicationRow, NotificationRow, PropertyRow } from '../types/models';
import type { ApplicationDTO, NotificationDTO, PropertyDTO } from '../types/dto';

export function serializeProperty(property: PropertyRow): PropertyDTO;
export function serializeProperty(property: null | undefined): null;
export function serializeProperty(property: PropertyRow | null | undefined): PropertyDTO | null {
  if (!property) return null;
  return {
    id: property.id,
    landlordId: property.landlord_id,
    title: property.title,
    description: property.description,
    address: property.address,
    rentAmount: Number(property.rent_amount),
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    status: property.status,
    createdAt: property.created_at,
    updatedAt: property.updated_at,
  };
}

/**
 * An application row optionally enriched with joined property/tenant fields,
 * as produced by the various ApplicationModel query methods.
 */
export type SerializableApplicationRow = ApplicationRow &
  Partial<{
    property_title: string;
    property_address: string;
    property_rent_amount: string;
    tenant_name: string;
    tenant_email: string;
  }>;

export function serializeApplication(application: SerializableApplicationRow): ApplicationDTO;
export function serializeApplication(application: null | undefined): null;
export function serializeApplication(
  application: SerializableApplicationRow | null | undefined
): ApplicationDTO | null {
  if (!application) return null;

  const base: ApplicationDTO = {
    id: application.id,
    propertyId: application.property_id,
    tenantId: application.tenant_id,
    message: application.message,
    status: application.status,
    createdAt: application.created_at,
    updatedAt: application.updated_at,
  };

  if (application.property_title !== undefined) {
    base.property = {
      title: application.property_title,
      address: application.property_address as string,
      rentAmount:
        application.property_rent_amount !== undefined
          ? Number(application.property_rent_amount)
          : undefined,
    };
  }

  if (application.tenant_name !== undefined) {
    base.tenant = {
      name: application.tenant_name,
      email: application.tenant_email as string,
    };
  }

  return base;
}

export function serializeNotification(notification: NotificationRow): NotificationDTO;
export function serializeNotification(notification: null | undefined): null;
export function serializeNotification(
  notification: NotificationRow | null | undefined
): NotificationDTO | null {
  if (!notification) return null;
  return {
    id: notification.id,
    userId: notification.user_id,
    title: notification.title,
    message: notification.message,
    isRead: notification.is_read,
    createdAt: notification.created_at,
  };
}

export default { serializeProperty, serializeApplication, serializeNotification };
