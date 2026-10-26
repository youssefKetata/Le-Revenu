import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Database => {
  if (env('DATABASE_CLIENT', 'postgres') !== 'postgres') {
    throw new Error('This project requires PostgreSQL (DATABASE_CLIENT=postgres).');
  }
  const password = env('DATABASE_PASSWORD');
  if (!password) {
    throw new Error('DATABASE_PASSWORD is required. Run npm run setup:env from the repository root.');
  }

  return {
    connection: {
      client: 'postgres',
      connection: {
        host: env('DATABASE_HOST', '127.0.0.1'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'le_revenu'),
        schema: env('DATABASE_SCHEMA', 'public'),
        user: env('DATABASE_USERNAME', 'le_revenu'),
        password,
        ssl: env.bool('DATABASE_SSL', false) && { rejectUnauthorized: true },
      },
      pool: {
        min: env.int('DATABASE_POOL_MIN', 0),
        max: env.int('DATABASE_POOL_MAX', 3),
      },
      acquireConnectionTimeout: 60_000,
    },
  };
};

export default config;
