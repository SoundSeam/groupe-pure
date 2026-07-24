import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";
import { isDatabaseConfigured } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  cmsPrisma?: PrismaClient;
};

export function getPrisma() {
  if (!isDatabaseConfigured()) {
    throw new Error("Database is not configured.");
  }

  if (!globalForPrisma.cmsPrisma) {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    });
    globalForPrisma.cmsPrisma = new PrismaClient({ adapter });
  }

  return globalForPrisma.cmsPrisma;
}
