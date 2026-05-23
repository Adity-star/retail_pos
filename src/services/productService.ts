// src/services/productService.ts

import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export class ProductService {
  static async getProducts(tenantId: string, filters?: {
    search?: string;
    categoryId?: string;
    lowStock?: boolean;
    isActive?: boolean;
  }) {
    const where: Prisma.ProductWhereInput = {
      tenantId,
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { sku: { contains: filters.search, mode: 'insensitive' } },
          { barcode: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
    };

    const products = await db.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filter low stock on the client side
    if (filters?.lowStock) {
      return products.filter(p => p.stock <= p.minStockLevel);
    }

    return products;
  }

  static async getProductById(id: string, tenantId: string) {
    return db.product.findFirst({
      where: { id, tenantId },
      include: {
        category: true,
      },
    });
  }

  static async getProductByBarcode(barcode: string, tenantId: string) {
    return db.product.findFirst({
      where: { barcode, tenantId, isActive: true },
    });
  }

  static async createProduct(data: Prisma.ProductCreateInput) {
    return db.product.create({
      data,
      include: {
        category: true,
      },
    });
  }

  static async updateProduct(id: string, tenantId: string, data: Prisma.ProductUpdateInput) {
    return db.product.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        category: true,
      },
    });
  }

  static async deleteProduct(id: string, tenantId: string) {
    // Soft delete by marking as inactive
    return db.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  static async generateSKU(tenantId: string, categoryName?: string): Promise<string> {
    const prefix = categoryName 
      ? categoryName.substring(0, 3).toUpperCase()
      : 'PRD';
    
    const lastProduct = await db.product.findFirst({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    const lastNumber = lastProduct?.sku.match(/\d+$/)?.[0] || '0';
    const nextNumber = (parseInt(lastNumber) + 1).toString().padStart(5, '0');

    return `${prefix}-${nextNumber}`;
  }

  static generateBarcode(): string {
    // Generate a random 12-digit barcode
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return timestamp + random;
  }
}