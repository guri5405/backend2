import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('properties', (table) => {
    table.increments('id').primary();
    table
      .integer('landlord_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE');
    table.string('title', 200).notNullable();
    table.text('description').notNullable();
    table.string('address', 500).notNullable();
    table.decimal('rent_amount', 12, 2).notNullable();
    table.integer('bedrooms').unsigned().notNullable().defaultTo(0);
    table.integer('bathrooms').unsigned().notNullable().defaultTo(0);
    table
      .enu('status', ['active', 'rented'], {
        useNative: true,
        enumName: 'property_status',
      })
      .notNullable()
      .defaultTo('active');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

    // Basic sanity checks at the DB level
    table.check('?? >= 0', ['rent_amount'], 'properties_rent_amount_non_negative');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('properties');
  await knex.raw('DROP TYPE IF EXISTS property_status');
}
