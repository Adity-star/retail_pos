// src/components/billing/BarcodeInput.tsx

'use client';

import { forwardRef } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Barcode } from 'lucide-react';

interface BarcodeInputProps {
  onSearchClick: () => void;
}

const BarcodeInput = forwardRef<HTMLInputElement, BarcodeInputProps>(
  ({ onSearchClick }, ref) => {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              ref={ref}
              placeholder="Scan barcode or press F2 to search..."
              className="pl-10 text-lg h-12"
              autoFocus
            />
          </div>
          <Button onClick={onSearchClick} size="lg" variant="outline">
            <Search className="w-5 h-5 mr-2" />
            Search (F2)
          </Button>
        </div>
      </Card>
    );
  }
);

BarcodeInput.displayName = 'BarcodeInput';

export default BarcodeInput;