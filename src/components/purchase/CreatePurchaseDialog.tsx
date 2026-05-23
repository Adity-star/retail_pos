// src/components/purchase/CreatePurchaseDialog.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Supplier } from '@prisma/client';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Search } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  productBarcode: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface CreatePurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suppliers: Supplier[];
}

export default function CreatePurchaseDialog({
  open,
  onOpenChange,
  suppliers,
}: CreatePurchaseDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const addProduct = (product: any) => {
    const existing = items.find((item) => item.productId === product.id);
    
    if (existing) {
      updateQuantity(existing.id, existing.quantity + 1);
    } else {
      const newItem: PurchaseItem = {
        id: crypto.randomUUID(),
        productId: product.id,
        productName: product.name,
        productBarcode: product.barcode,
        quantity: 1,
        rate: Number(product.purchasePrice),
        amount: Number(product.purchasePrice),
      };
      setItems([...items, newItem]);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems(
      items.map((item) =>
        item.id === id
          ? { ...item, quantity, amount: item.rate * quantity }
          : item
      )
    );
  };

  const updateRate = (id: string, rate: number) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? { ...item, rate, amount: rate * item.quantity }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId) {
      toast.error('Please select a supplier');
      return;
    }

    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          totalAmount,
          notes,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create purchase');
      }

      const purchase = await response.json();
      toast.success(`Purchase ${purchase.voucherNo} created successfully!`);
      onOpenChange(false);
      router.refresh();

      // Reset form
      setSupplierId('');
      setNotes('');
      setItems([]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create purchase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Purchase Entry</DialogTitle>
            <DialogDescription>
              Record a new purchase and update inventory
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Supplier Selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Purchase Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers
                        .filter((s) => s.isActive)
                        .map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="border rounded-lg p-8 text-center text-gray-500">
                  No items added yet
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="w-32">Quantity</TableHead>
                        <TableHead className="w-32">Rate</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-xs text-gray-500">
                                {item.productBarcode}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(
                                  item.id,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              min="1"
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.rate}
                              onChange={(e) =>
                                updateRate(
                                  item.id,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              min="0"
                              className="w-24"
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ₹{item.amount.toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Total */}
            {items.length > 0 && (
              <div className="space-y-2">
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-blue-600">
                    ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Purchase
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Product Search */}
      <ProductSearchForPurchase
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelect={addProduct}
      />
    </>
  );
}

// Product Search Component
function ProductSearchForPurchase({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (product: any) => void;
}) {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('isActive', 'true');

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    if (open) fetchProducts();
  }, [open, search]);

  const handleSelect = (product: any) => {
    onSelect(product);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Product</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-10"
              autoFocus
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading ? (
              <p className="text-center py-8 text-gray-400">Loading...</p>
            ) : products.length === 0 ? (
              <p className="text-center py-8 text-gray-400">No products found</p>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelect(product)}
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      {product.barcode} • Stock: {product.stock}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ₹{Number(product.purchasePrice).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-500">Purchase Price</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}