import "dotenv/config";

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  experimental: {
    externalTables: true,
  },
  tables: {
    external: [
      "public.contact_rate_limits",
      "public.contact_submissions",
    ],
  },
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url:
      process.env.DIRECT_URL ??
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@127.0.0.1:5432/groupe_pure",
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
