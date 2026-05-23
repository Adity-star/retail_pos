// src/components/purchase/PurchaseHeader.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import CreatePurchaseDialog from './CreatePurchaseDialog.tsx';
import ManageSuppliersDialog from './ManageSupplierDialog.tsx';
import { Supplier } from '@prisma/client';

interface PurchaseHeaderProps {
  suppliers: Supplier[];
}

export default function PurchaseHeader({ suppliers }: PurchaseHeaderProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [suppliersOpen, setSuppliersOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Purchase Entry</h1>
        <p className="text-sm text-gray-500 mt-1">
          Record and manage purchase invoices
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setSuppliersOpen(true)}>
          <Users className="w-4 h-4 mr-2" />
          Suppliers
        </Button>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Purchase
        </Button>
      </div>

      <CreatePurchaseDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        suppliers={suppliers}
      />

      <ManageSuppliersDialog
        open={suppliersOpen}
        onOpenChange={setSuppliersOpen}
      />
    </div>
  );
}