// src/components/billing/BillingHeader.tsx

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Barcode, Keyboard } from 'lucide-react';

export default function BillingHeader() {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Barcode className="w-6 h-6" />
            Sales Barcode
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Scan barcodes or search products to add to cart
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Keyboard className="w-3 h-3" />
            F2: Search
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Keyboard className="w-3 h-3" />
            F4: Save
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Keyboard className="w-3 h-3" />
            F8: Clear
          </Badge>
        </div>
      </div>
    </Card>
  );
}