import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name', 150).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table
      .enu('role', ['landlord', 'tenant'], {
        useNative: true,
        enumName: 'user_role',
      })
      .notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
  await knex.raw('DROP TYPE IF EXISTS user_role');
}
