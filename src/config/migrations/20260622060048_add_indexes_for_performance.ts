import type { Knex } from 'knex';

/**
 * Adds indexes to support common filter/sort/lookup patterns used by the API:
 * - GET /api/properties filters by status, bedrooms, rentAmount range, and sorts by rentAmount/createdAt
 * - GET /api/properties/:id/applications and /api/applications/my-applications filter by FK + status
 * - GET /api/notifications filters by user_id + is_read
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('properties', (table) => {
    table.index(['status'], 'idx_properties_status');
    table.index(['landlord_id'], 'idx_properties_landlord_id');
    table.index(['rent_amount'], 'idx_properties_rent_amount');
    table.index(['bedrooms'], 'idx_properties_bedrooms');
    table.index(['created_at'], 'idx_properties_created_at');
  });

  await knex.schema.alterTable('rental_applications', (table) => {
    table.index(['tenant_id'], 'idx_applications_tenant_id');
    table.index(['property_id'], 'idx_applications_property_id');
    table.index(['status'], 'idx_applications_status');
  });

  await knex.schema.alterTable('notifications', (table) => {
    table.index(['user_id', 'is_read'], 'idx_notifications_user_unread');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('properties', (table) => {
    table.dropIndex(['status'], 'idx_properties_status');
    table.dropIndex(['landlord_id'], 'idx_properties_landlord_id');
    table.dropIndex(['rent_amount'], 'idx_properties_rent_amount');
    table.dropIndex(['bedrooms'], 'idx_properties_bedrooms');
    table.dropIndex(['created_at'], 'idx_properties_created_at');
  });

  await knex.schema.alterTable('rental_applications', (table) => {
    table.dropIndex(['tenant_id'], 'idx_applications_tenant_id');
    table.dropIndex(['property_id'], 'idx_applications_property_id');
    table.dropIndex(['status'], 'idx_applications_status');
  });

  await knex.schema.alterTable('notifications', (table) => {
    table.dropIndex(['user_id', 'is_read'], 'idx_notifications_user_unread');
  });
}
