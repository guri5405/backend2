import knexFactory, { Knex } from 'knex';
import knexConfig from '../../knexfile';
import config from './env';

type Environment = 'development' | 'test' | 'production';

const environment: Environment =
  config.env === 'test' ? 'test' : config.env === 'production' ? 'production' : 'development';

const db: Knex = knexFactory(knexConfig[environment] as Knex.Config);

export default db;
