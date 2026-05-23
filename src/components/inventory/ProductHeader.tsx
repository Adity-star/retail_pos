// src/components/inventory/ProductsHeader.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileDown, FileUp } from 'lucide-react';
import AddProductDialog from './AddProductDialog';
import { Category } from '@prisma/client';

interface ProductsHeaderProps {
  categories: Category[];
}

export default function ProductsHeader({ categories }: ProductsHeaderProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your inventory and product catalog
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <FileUp className="w-4 h-4 mr-2" />
          Import
        </Button>
        <Button variant="outline" size="sm">
          <FileDown className="w-4 h-4 mr-2" />
          Export
        </Button>
        <Button size="sm" onClick={() => setAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <AddProductDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        categories={categories}
      />
    </div>
  );
}