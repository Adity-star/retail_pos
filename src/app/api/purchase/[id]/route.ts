// src/app/api/purchases/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { PurchaseService } from '@/services/purchaseService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { tenantId } = await getTenantContext();
    const purchase = await PurchaseService.getPurchaseById(params.id, tenantId);

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(purchase);
  } catch (error) {
    console.error('GET /api/purchases/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { tenantId, userId } = await getTenantContext();
    await PurchaseService.deletePurchase(params.id, tenantId, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/purchases/[id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete purchase' },
      { status: 500 }
    );
  }
}