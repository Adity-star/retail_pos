// src/services/supplierService.ts

import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export class SupplierService {
  static async getSuppliers(tenantId: string, filters?: {
    search?: string;
    isActive?: boolean;
  }) {
    const where: Prisma.SupplierWhereInput = {
      tenantId,
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { phone: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
    };

    return db.supplier.findMany({
      where,
      include: {
        _count: {
          select: { purchases: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async getSupplierById(id: string, tenantId: string) {
    return db.supplier.findFirst({
      where: { id, tenantId },
      include: {
        purchases: {
          orderBy: { purchaseDate: 'desc' },
          take: 10,
        },
      },
    });
  }

  static async createSupplier(data: Prisma.SupplierCreateInput) {
    return db.supplier.create({
      data,
    });
  }

  static async updateSupplier(id: string, tenantId: string, data: Prisma.SupplierUpdateInput) {
    return db.supplier.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  static async deleteSupplier(id: string, tenantId: string) {
    // Soft delete
    return db.supplier.update({
      where: { id },
      data: { isActive: false },
    });
  }
}