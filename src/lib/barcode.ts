// src/lib/barcode.ts

import bwipjs from 'bwip-js';

export async function generateBarcodeImage(
  barcode: string,
  options?: {
    width?: number;
    height?: number;
  }
): Promise<string> {
  try {
    const png = await bwipjs.toBuffer({
      bcid: 'code128',       // Barcode type
      text: barcode,          // Text to encode
      scale: 3,               // 3x scaling factor
      height: options?.height || 10,  // Bar height, in millimeters
      includetext: true,      // Show human-readable text
      textxalign: 'center',   // Always good to set this
    });

    // Convert to base64
    return `data:image/png;base64,${png.toString('base64')}`;
  } catch (error) {
    console.error('Barcode generation error:', error);
    throw new Error('Failed to generate barcode');
  }
}