import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({
  path: '.env',
});

export const databaseSchemaPath = './lib/db/schema.ts';
export const migrationsPath = './lib/db/migrations';
export const dialect = 'postgresql';

export default defineConfig({
  schema: databaseSchemaPath,
  out: migrationsPath,
  dialect: dialect,
  dbCredentials: {
    // biome-ignore lint: Forbidden non-null assertion.
    url: process.env.POSTGRES_URL!,
  },
});
