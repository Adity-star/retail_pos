// src/app/api/products/by-barcode/[barcode]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { ProductService } from '@/services/productService';

export async function GET(
  request: NextRequest,
  { params }: { params: { barcode: string } }
) {
  try {
    const { tenantId } = await getTenantContext();
    const product = await ProductService.getProductByBarcode(params.barcode, tenantId);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('GET /api/products/by-barcode/[barcode] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}