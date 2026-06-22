import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('rental_applications', (table) => {
    table.increments('id').primary();
    table
      .integer('property_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('properties')
      .onDelete('CASCADE');
    table
      .integer('tenant_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.text('message').nullable();
    table
      .enu('status', ['pending', 'approved', 'rejected'], {
        useNative: true,
        enumName: 'application_status',
      })
      .notNullable()
      .defaultTo('pending');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

    // Business rule: a tenant cannot apply twice for the same property
    table.unique(['property_id', 'tenant_id'], {
      indexName: 'uniq_property_tenant_application',
    });
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('rental_applications');
  await knex.raw('DROP TYPE IF EXISTS application_status');
}
