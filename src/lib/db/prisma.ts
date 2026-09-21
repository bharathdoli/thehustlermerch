import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@/src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
};

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,

    // Keep the development connection pool small.
    max: 5,

    // Wait up to 10 seconds for a database connection.
    connectionTimeoutMillis: 10000,

    // Close idle connections after 30 seconds.
    idleTimeoutMillis: 30000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pool = pool;
}

export const prisma =
  globalForPrisma.prisma ??
  (() => {
    const adapter = new PrismaPg(pool);

    const client = new PrismaClient({
      adapter,
    });

    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = client;
    }

    return client;
  })();