// src/components/billing/TotalsPanel.tsx

'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useBillingStore } from '@/store/billingStore';

export default function TotalsPanel() {
  const {
    items,
    subtotal,
    discountPercent,
    discountAmount,
    totalAmount,
    setDiscountPercent,
  } = useBillingStore();

  return (
    <Card className="p-6 space-y-4">
      <h3 className="font-semibold text-lg">Bill Summary</h3>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Items:</span>
          <span className="font-medium">{items.length}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Quantity:</span>
          <span className="font-medium">
            {items.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </div>

        <Separator />

        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium">
            ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <Label htmlFor="globalDiscount" className="text-gray-600">
            Discount %:
          </Label>
          <Input
            id="globalDiscount"
            type="number"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
            className="w-24 text-right"
            min="0"
            max="100"
            step="0.1"
          />
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount Amount:</span>
            <span>
              -₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between text-xl font-bold">
          <span>Total Amount:</span>
          <span className="text-blue-600">
            ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </Card>
  );
}