// src/components/purchase/ViewPurchaseDialog.tsx

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

interface ViewPurchaseDialogProps {
  purchase: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ViewPurchaseDialog({
  purchase,
  open,
  onOpenChange,
}: ViewPurchaseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Purchase Voucher: {purchase.voucherNo}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Details */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Supplier:</h3>
              <p className="font-medium">{purchase.supplier.name}</p>
              {purchase.supplier.contactPerson && (
                <p className="text-sm text-gray-600">
                  Contact: {purchase.supplier.contactPerson}
                </p>
              )}
              {purchase.supplier.phone && (
                <p className="text-sm text-gray-600">
                  Phone: {purchase.supplier.phone}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm">
                <span className="font-medium">Voucher No:</span>{' '}
                {purchase.voucherNo}
              </p>
              <p className="text-sm">
                <span className="font-medium">Date:</span>{' '}
                {format(new Date(purchase.purchaseDate), 'dd MMM yyyy, hh:mm a')}
              </p>
            </div>
          </div>

          {purchase.notes && (
            <div>
              <h3 className="font-semibold mb-2">Notes:</h3>
              <p className="text-sm text-gray-600">{purchase.notes}</p>
            </div>
          )}

          <Separator />

          {/* Items */}
          <div>
            <h3 className="font-semibold mb-4">Items:</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchase.items.map((item: any, index: number) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.product.barcode}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{Number(item.rate).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span className="text-blue-600">
                  ₹{Number(purchase.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}