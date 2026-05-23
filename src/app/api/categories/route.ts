// src/app/api/categories/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { CategoryService } from '@/services/categoryService';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { tenantId } = await getTenantContext();
    const categories = await CategoryService.getCategories(tenantId);

    return NextResponse.json(categories);
  } catch (error) {
    console.error('GET /api/categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tenantId } = await getTenantContext();
    const body = await request.json();

    const validatedData = categorySchema.parse(body);

    const category = await CategoryService.createCategory({
      ...validatedData,
      tenant: { connect: { id: tenantId } },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('POST /api/categories error:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}