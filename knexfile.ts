import dotenv from 'dotenv';
import type { Knex } from 'knex';

dotenv.config();

/**
 * Knex configuration file.
 *
 * Usage:
 *   npx knex migrate:latest             -> runs pending migrations (development env by default)
 *   npx knex migrate:rollback           -> rolls back the last batch of migrations
 *   npx knex migrate:rollback --all     -> rolls back ALL migrations
 *   npx knex migrate:status             -> shows which migrations have run
 *   npx knex migrate:make migration_name -> creates a new migration file
 *   npx knex seed:run                   -> runs seed files
 *
 *   KNEX_ENV/NODE_ENV controls which block below is used, e.g.:
 *   NODE_ENV=production npx knex migrate:latest --env production
 */

interface BaseConnection {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

const baseConnection: BaseConnection = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '', 10) || 5432,
  user: process.env.DB_USER || 'rental_user',
  password: process.env.DB_PASSWORD || 'rental_pass',
  database: process.env.DB_NAME || 'rental_db',
};

const knexConfig: Record<string, Knex.Config> = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || baseConnection,
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './seeds',
    },
    pool: { min: 2, max: 10 },
  },

  test: {
    client: 'pg',
    connection: process.env.DATABASE_URL || {
      ...baseConnection,
      database: process.env.TEST_DB_NAME || 'rental_db_test',
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './seeds',
    },
    pool: { min: 1, max: 5 },
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL || {
      ...baseConnection,
      ssl: { rejectUnauthorized: false },
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './seeds',
    },
    pool: { min: 2, max: 20 },
  },
};

export default knexConfig;
