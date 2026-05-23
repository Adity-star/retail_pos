// src/components/billing/CartTable.tsx

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Minus, Plus } from 'lucide-react';
import { useBillingStore } from '@/store/billingStore';

export default function CartTable() {
  const { items, updateQuantity, updateItemDiscount, removeItem } = useBillingStore();

  if (items.length === 0) {
    return (
      <Card className="flex-1 flex items-center justify-center">
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Cart is empty</p>
          <p className="text-gray-400 text-sm mt-2">
            Scan a barcode or search for products to add items
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex-1 overflow-hidden flex flex-col">
      <div className="overflow-x-auto flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="w-32 text-center">Qty</TableHead>
              <TableHead className="w-20 text-right">Disc%</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.barcode}</p>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  ₹{item.rate.toLocaleString('en-IN')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.id, parseInt(e.target.value) || 0)
                      }
                      className="w-16 text-center h-8"
                      min="1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.discountPercent}
                    onChange={(e) =>
                      updateItemDiscount(item.id, parseFloat(e.target.value) || 0)
                    }
                    className="w-16 text-right h-8"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </TableCell>
                <TableCell className="text-right font-semibold">
                  ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}