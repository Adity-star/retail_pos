// src/services/categoryService.ts

import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export class CategoryService {
  static async getCategories(tenantId: string) {
    return db.category.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  static async getCategoryById(id: string, tenantId: string) {
    return db.category.findFirst({
      where: { id, tenantId },
    });
  }

  static async createCategory(data: Prisma.CategoryCreateInput) {
    return db.category.create({
      data,
    });
  }

  static async updateCategory(id: string, tenantId: string, data: Prisma.CategoryUpdateInput) {
    return db.category.update({
      where: { id },
      data,
    });
  }

  static async deleteCategory(id: string, tenantId: string) {
    return db.category.delete({
      where: { id },
    });
  }
}