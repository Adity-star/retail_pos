// src/app/api/products/generate-barcode/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { generateBarcodeImage } from '@/lib/barcode';

export async function POST(request: NextRequest) {
  try {
    const { barcode } = await request.json();

    if (!barcode) {
      return NextResponse.json(
        { error: 'Barcode is required' },
        { status: 400 }
      );
    }

    const barcodeImage = await generateBarcodeImage(barcode);

    return NextResponse.json({ image: barcodeImage });
  } catch (error) {
    console.error('POST /api/products/generate-barcode error:', error);
    return NextResponse.json(
      { error: 'Failed to generate barcode' },
      { status: 500 }
    );
  }
}