// src/services/purchaseService.ts

import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export class PurchaseService {
  static async getPurchases(tenantId: string, filters?: {
    supplierId?: string;
    fromDate?: Date;
    toDate?: Date;
  }) {
    const where: Prisma.PurchaseWhereInput = {
      tenantId,
      ...(filters?.supplierId && { supplierId: filters.supplierId }),
      ...(filters?.fromDate && filters?.toDate && {
        purchaseDate: {
          gte: filters.fromDate,
          lte: filters.toDate,
        },
      }),
    };

    return db.purchase.findMany({
      where,
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        purchaseDate: 'desc',
      },
    });
  }

  static async getPurchaseById(id: string, tenantId: string) {
    return db.purchase.findFirst({
      where: { id, tenantId },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  static async generateVoucherNo(tenantId: string): Promise<string> {
    const lastPurchase = await db.purchase.findFirst({
      where: { tenantId },
      orderBy: { voucherNo: 'desc' },
    });

    const lastNumber = lastPurchase?.voucherNo.match(/\d+$/)?.[0] || '0';
    const nextNumber = (parseInt(lastNumber) + 1).toString().padStart(6, '0');

    return `PUR-${nextNumber}`;
  }

  static async createPurchase(
    tenantId: string,
    userId: string,
    data: {
      supplierId: string;
      totalAmount: number;
      notes?: string;
      items: Array<{
        productId: string;
        quantity: number;
        rate: number;
        amount: number;
      }>;
    }
  ) {
    // Generate voucher number
    const voucherNo = await this.generateVoucherNo(tenantId);

    // Create purchase with items in a transaction
    return db.$transaction(async (tx) => {
      // Create purchase
      const purchase = await tx.purchase.create({
        data: {
          voucherNo,
          tenantId,
          supplierId: data.supplierId,
          totalAmount: data.totalAmount,
          notes: data.notes,
          createdBy: userId,
        },
      });

      // Create purchase items and update stock
      for (const item of data.items) {
        // Get current product stock
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true, name: true },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        // Create purchase item
        await tx.purchaseItem.create({
          data: {
            purchaseId: purchase.id,
            productId: item.productId,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
          },
        });

        // Update product stock
        const newStock = product.stock + item.quantity;
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: newStock },
        });

        // Create inventory log
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            type: 'PURCHASE',
            referenceId: purchase.id,
            referenceType: 'purchase',
            quantityBefore: product.stock,
            quantityChange: item.quantity,
            quantityAfter: newStock,
            createdBy: userId,
          },
        });
      }

      return purchase;
    });
  }

  static async deletePurchase(id: string, tenantId: string, userId: string) {
    return db.$transaction(async (tx) => {
      // Get purchase with items
      const purchase = await tx.purchase.findFirst({
        where: { id, tenantId },
        include: { items: true },
      });

      if (!purchase) {
        throw new Error('Purchase not found');
      }

      // Reverse stock for each item
      for (const item of purchase.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true },
        });

        if (!product) continue;

        const newStock = product.stock - item.quantity;

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: newStock },
        });

        // Create inventory log
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            type: 'ADJUSTMENT',
            referenceId: purchase.id,
            referenceType: 'purchase_deletion',
            quantityBefore: product.stock,
            quantityChange: -item.quantity,
            quantityAfter: newStock,
            remarks: `Purchase ${purchase.voucherNo} deleted`,
            createdBy: userId,
          },
        });
      }

      // Delete purchase (cascade will delete items)
      await tx.purchase.delete({
        where: { id },
      });
    });
  }
}