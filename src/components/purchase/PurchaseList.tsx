// src/components/purchase/PurchaseList.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Purchase, Supplier } from '@prisma/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import ViewPurchaseDialog from './ViewPurchaseDialog';

type PurchaseWithRelations = Purchase & {
  supplier: Supplier;
  items: any[];
};

interface PurchaseListProps {
  initialPurchases: PurchaseWithRelations[];
  suppliers: Supplier[];
}

export default function PurchaseList({ initialPurchases, suppliers }: PurchaseListProps) {
  const router = useRouter();
  const [purchases, setPurchases] = useState(initialPurchases);
  const [viewingPurchase, setViewingPurchase] = useState<PurchaseWithRelations | null>(null);

  const handleDelete = async (id: string, voucherNo: string) => {
    if (!confirm(`Delete purchase ${voucherNo}? This will reverse the stock changes.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/purchases/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      setPurchases(purchases.filter((p) => p.id !== id));
      toast.success('Purchase deleted successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete purchase');
    }
  };

  if (purchases.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-500">No purchases recorded yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Click "New Purchase" to create your first purchase entry
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Voucher No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>
                  <span className="font-mono font-medium">{purchase.voucherNo}</span>
                </TableCell>
                <TableCell>
                  {format(new Date(purchase.purchaseDate), 'dd MMM yyyy, hh:mm a')}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{purchase.supplier.name}</p>
                    {purchase.supplier.phone && (
                      <p className="text-xs text-gray-500">{purchase.supplier.phone}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {purchase.items.length} items
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  ₹{Number(purchase.totalAmount).toLocaleString('en-IN')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger aschild>
                      <div variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setViewingPurchase(purchase)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(purchase.id, purchase.voucherNo)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {viewingPurchase && (
        <ViewPurchaseDialog
          purchase={viewingPurchase}
          open={!!viewingPurchase}
          onOpenChange={(open) => !open && setViewingPurchase(null)}
        />
      )}
    </>
  );
}