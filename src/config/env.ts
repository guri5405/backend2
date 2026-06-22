import dotenv from 'dotenv';

dotenv.config();

const required = ['JWT_SECRET'] as const;

for (const key of required) {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.warn(`[config] Warning: environment variable ${key} is not set.`);
  }
}

const env = process.env.NODE_ENV || 'development';

export interface AppConfig {
  env: string;
  isProduction: boolean;
  isTest: boolean;
  port: number;
  db: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    connectionString: string | undefined;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

const config: AppConfig = {
  env,
  isProduction: env === 'production',
  isTest: env === 'test',
  port: parseInt(process.env.PORT || '', 10) || 4000,

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '', 10) || 5432,
    user: process.env.DB_USER || 'rental_user',
    password: process.env.DB_PASSWORD || 'rental_pass',
    database:
      env === 'test'
        ? process.env.TEST_DB_NAME || 'rental_db_test'
        : process.env.DB_NAME || 'rental_db',
    connectionString: process.env.DATABASE_URL || undefined,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '', 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX || '', 10) || 100,
  },
};

export default config;
