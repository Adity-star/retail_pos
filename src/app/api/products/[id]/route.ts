// src/app/api/products/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { ProductService } from '@/services/productService';
import { z } from 'zod';

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  categoryId: z.string().optional(),
  class: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  gender: z.string().optional(),
  description: z.string().optional(),
  purchasePrice: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  mrp: z.number().optional(),
  stock: z.number().int().min(0).optional(),
  minStockLevel: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { tenantId } = await getTenantContext();
    const product = await ProductService.getProductById(params.id, tenantId);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('GET /api/products/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { tenantId } = await getTenantContext();
    const body = await request.json();

    const validatedData = updateProductSchema.parse(body);

    const updateData: any = { ...validatedData };
    
    if (validatedData.categoryId) {
      updateData.category = { connect: { id: validatedData.categoryId } };
      delete updateData.categoryId;
    }

    const product = await ProductService.updateProduct(
      params.id,
      tenantId,
      updateData
    );

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('PATCH /api/products/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { tenantId } = await getTenantContext();
    await ProductService.deleteProduct(params.id, tenantId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/products/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}