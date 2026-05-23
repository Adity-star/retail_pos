// src/app/api/purchases/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { PurchaseService } from '@/services/purchaseService';
import { z } from 'zod';

const purchaseItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  rate: z.number().positive(),
  amount: z.number().positive(),
});

const createPurchaseSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  totalAmount: z.number().min(0),
  notes: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, 'At least one item required'),
});

export async function GET(request: NextRequest) {
  try {
    const { tenantId } = await getTenantContext();
    const { searchParams } = new URL(request.url);

    const filters = {
      supplierId: searchParams.get('supplierId') || undefined,
    };

    const purchases = await PurchaseService.getPurchases(tenantId, filters);

    return NextResponse.json(purchases);
  } catch (error) {
    console.error('GET /api/purchases error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tenantId, userId } = await getTenantContext();
    const body = await request.json();

    const validatedData = createPurchaseSchema.parse(body);

    const purchase = await PurchaseService.createPurchase(
      tenantId,
      userId,
      validatedData
    );

    // Fetch complete purchase with items
    const completePurchase = await PurchaseService.getPurchaseById(
      purchase.id,
      tenantId
    );

    return NextResponse.json(completePurchase, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('POST /api/purchases error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create purchase' },
      { status: 500 }
    );
  }
}