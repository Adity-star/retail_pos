// src/lib/db.ts

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

// Helper to get Prisma client with tenant context
export function getPrismaWithTenant(tenantId: string) {
  // This will be used in middleware to automatically filter by tenant
  return db.$extends({
    query: {
      // Add tenantId filter to all models that have it
      $allModels: {
        async findMany({ args, query, model }) {
          // Skip if model doesn't have tenantId
          if (!('tenantId' in (args.where || {}))) {
            return query(args);
          }
          
          args.where = { ...args.where, tenantId };
          return query(args);
        },
      },
    },
  });
}