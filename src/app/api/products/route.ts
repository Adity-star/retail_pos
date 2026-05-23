// src/app/api/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { ProductService } from '@/services/productService';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().min(1, 'Barcode is required'),
  categoryId: z.string().optional(),
  class: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  gender: z.string().optional(),
  description: z.string().optional(),
  purchasePrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  mrp: z.number().optional(),
  stock: z.number().int().min(0),
  minStockLevel: z.number().int().min(0),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const { tenantId } = await getTenantContext();
    const { searchParams } = new URL(request.url);

    const filters = {
      search: searchParams.get('search') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      lowStock: searchParams.get('lowStock') === 'true',
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
    };

    const products = await ProductService.getProducts(tenantId, filters);

    return NextResponse.json(products);
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tenantId } = await getTenantContext();
    const body = await request.json();

    const validatedData = productSchema.parse(body);

    const product = await ProductService.createProduct({
      ...validatedData,
      tenant: { connect: { id: tenantId } },
      ...(validatedData.categoryId && {
        category: { connect: { id: validatedData.categoryId } },
      }),
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('POST /api/products error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}