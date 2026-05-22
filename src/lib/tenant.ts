// src/lib/tenant.ts

import { headers } from 'next/headers';
import { db } from './db';

export async function getTenantContext() {
  const headersList = headers();
  const tenantId = headersList.get('x-tenant-id');
  const userId = headersList.get('x-user-id');
  const userRole = headersList.get('x-user-role');
  
  if (!tenantId || !userId) {
    throw new Error('No tenant context found');
  }
  
  const tenant = await db.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      plan: true,
    }
  });
  
  if (!tenant || !tenant.isActive) {
    throw new Error('Tenant not found or inactive');
  }
  
  return {
    tenantId,
    userId,
    userRole: userRole as 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'STAFF',
    tenant,
  };
}