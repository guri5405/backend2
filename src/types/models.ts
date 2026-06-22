export type UserRole = 'landlord' | 'tenant';

export type PropertyStatus = 'active' | 'rented';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

/** Full `users` table row, including the hashed password. */
export interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

/** `users` row with the password column omitted — safe to expose via the API. */
export type PublicUserRow = Omit<UserRow, 'password'>;

/** Full `properties` table row. */
export interface PropertyRow {
  id: number;
  landlord_id: number;
  title: string;
  description: string;
  address: string;
  /** Numeric column — the pg driver returns DECIMAL as a string. */
  rent_amount: string;
  bedrooms: number;
  bathrooms: number;
  status: PropertyStatus;
  created_at: Date;
  updated_at: Date;
}

/** Full `rental_applications` table row. */
export interface ApplicationRow {
  id: number;
  property_id: number;
  tenant_id: number;
  message: string | null;
  status: ApplicationStatus;
  created_at: Date;
  updated_at: Date;
}

/**
 * `rental_applications` joined with `properties`, used to check property
 * ownership for a given application in a single query.
 */
export interface ApplicationWithPropertyRow extends ApplicationRow {
  property_landlord_id: number;
  property_status: PropertyStatus;
  property_title: string;
}

/**
 * `rental_applications` joined with `properties`, used for the
 * "my applications" (tenant-facing) listing.
 */
export interface ApplicationWithPropertyInfoRow extends ApplicationRow {
  property_title: string;
  property_address: string;
  property_rent_amount: string;
}

/**
 * `rental_applications` joined with `users` (tenant), used for the
 * "applications for property" (landlord-facing) listing.
 */
export interface ApplicationWithTenantInfoRow extends ApplicationRow {
  tenant_name: string;
  tenant_email: string;
}

/** Full `notifications` table row. */
export interface NotificationRow {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: Date;
}
