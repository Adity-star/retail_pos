// src/app/api/sales/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';
import { z } from 'zod';

const saleItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  productBarcode: z.string(),
  quantity: z.number().int().positive(),
  rate: z.number().positive(),
  discountPercent: z.number().min(0).max(100),
  discountAmount: z.number().min(0),
  amount: z.number().min(0),
});

const createSaleSchema = z.object({
  customerName: z.string().min(1),
  customerClass: z.string().optional(),
  customerMobile: z.string().optional(),
  paymentMode: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER']),
  subtotal: z.number().min(0),
  discountPercent: z.number().min(0).max(100),
  discountAmount: z.number().min(0),
  totalAmount: z.number().min(0),
  items: z.array(saleItemSchema).min(1, 'At least one item required'),
});

export async function POST(request: NextRequest) {
  try {
    const { tenantId, userId } = await getTenantContext();
    const body = await request.json();

    const validatedData = createSaleSchema.parse(body);

    // Generate bill number
    const lastSale = await db.sale.findFirst({
      where: { tenantId },
      orderBy: { billNo: 'desc' },
    });

    const lastBillNo = lastSale?.billNo || '0';
    const nextBillNo = (parseInt(lastBillNo) + 1).toString().padStart(6, '0');

    // Create sale with items in a transaction
    const sale = await db.$transaction(async (tx) => {
      // Create sale
      const newSale = await tx.sale.create({
        data: {
          billNo: nextBillNo,
          tenantId,
          customerName: validatedData.customerName,
          customerClass: validatedData.customerClass,
          customerMobile: validatedData.customerMobile,
          paymentMode: validatedData.paymentMode,
          subtotal: validatedData.subtotal,
          discountPercent: validatedData.discountPercent,
          discountAmount: validatedData.discountAmount,
          totalAmount: validatedData.totalAmount,
          createdBy: userId,
        },
      });

      // Create sale items and update stock
      for (const item of validatedData.items) {
        // Get current product stock
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true, name: true },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productName}`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        // Create sale item
        await tx.saleItem.create({
          data: {
            saleId: newSale.id,
            productId: item.productId,
            productName: item.productName,
            productBarcode: item.productBarcode,
            quantity: item.quantity,
            rate: item.rate,
            discountPercent: item.discountPercent,
            discountAmount: item.discountAmount,
            amount: item.amount,
          },
        });

        // Update product stock
        const newStock = product.stock - item.quantity;
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: newStock },
        });

        // Create inventory log
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            type: 'SALE',
            referenceId: newSale.id,
            referenceType: 'sale',
            quantityBefore: product.stock,
            quantityChange: -item.quantity,
            quantityAfter: newStock,
            createdBy: userId,
          },
        });
      }

      return newSale;
    });

    // Fetch complete sale with items
    const completeSale = await db.sale.findUnique({
      where: { id: sale.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(completeSale, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('POST /api/sales error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create sale' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { tenantId } = await getTenantContext();
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const sales = await db.sale.findMany({
      where: { tenantId, isReturn: false },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { billDate: 'desc' },
      take: limit,
      skip: offset,
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error('GET /api/sales error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales' },
      { status: 500 }
    );
  }
}