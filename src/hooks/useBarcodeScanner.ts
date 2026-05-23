// src/hooks/useBarcodeScanner.ts

import { useEffect, useRef } from 'react';
import { useBillingStore } from '@/store/billingStore';
import { toast } from 'sonner';

export function useBarcodeScanner() {
  const addItem = useBillingStore((state) => state.addItem);
  const bufferRef = useRef('');
  const lastKeyTimeRef = useRef(Date.now());

  useEffect(() => {
    const handleKeyPress = async (e: KeyboardEvent) => {
      // Ignore if typing in an input field
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const currentTime = Date.now();

      // Reset buffer if gap > 100ms (human typing)
      if (currentTime - lastKeyTimeRef.current > 100) {
        bufferRef.current = '';
      }

      lastKeyTimeRef.current = currentTime;

      // Enter key - process barcode
      if (e.key === 'Enter') {
        if (bufferRef.current.length > 0) {
          const barcode = bufferRef.current;
          bufferRef.current = '';

          try {
            const response = await fetch(`/api/products/by-barcode/${barcode}`);

            if (!response.ok) {
              toast.error(`Product not found: ${barcode}`);
              return;
            }

            const product = await response.json();

            // Check stock
            if (product.stock <= 0) {
              toast.error(`Out of stock: ${product.name}`);
              return;
            }

            addItem(product);
            toast.success(`Added: ${product.name}`);
          } catch (error) {
            toast.error('Error scanning barcode');
          }
        }
      } else if (e.key.length === 1) {
        // Add character to buffer
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [addItem]);
}