// src/components/billing/BillingInterface.tsx

'use client';

import { useState, useRef } from 'react';
import { useBillingStore } from '@/store/billingStore';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import BillingHeader from './BillingHeader';
import CustomerSection from './CustomerSection';
import BarcodeInput from './BarcodeInput';
import CartTable from './CartTable';
import TotalsPanel from './TotalsPanel';
import QuickActions from './QuickActions';
import ProductSearchDialog from './ProductSearchDialog';
import InvoiceDialog from './InvoiceDialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';

export default function BillingInterface() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [savedSale, setSavedSale] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const {
    items,
    customer,
    subtotal,
    discountPercent,
    discountAmount,
    totalAmount,
    paymentMode,
    clearCart,
  } = useBillingStore();

  // Enable barcode scanner
  useBarcodeScanner();

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSearch: () => setSearchOpen(true),
    onSave: handleSave,
    onClear: handleClear,
  });

  async function handleSave() {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (!customer.name || customer.name === 'Cash Account') {
      toast.error('Please enter customer name');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customer.name,
          customerClass: customer.class,
          customerMobile: customer.mobile,
          paymentMode,
          subtotal,
          discountPercent,
          discountAmount,
          totalAmount,
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.name,
            productBarcode: item.barcode,
            quantity: item.quantity,
            rate: item.rate,
            discountPercent: item.discountPercent,
            discountAmount: item.discountAmount,
            amount: item.amount,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save sale');
      }

      const sale = await response.json();
      setSavedSale(sale);
      setInvoiceOpen(true);
      
      toast.success(`Invoice #${sale.billNo} saved successfully!`);
      
      // Clear cart after successful save
      clearCart();
      
      // Focus back on barcode input
      setTimeout(() => barcodeInputRef.current?.focus(), 100);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save invoice');
    } finally {
      setSaving(false);
    }
  }

  function handleClear() {
    if (items.length > 0) {
      if (confirm('Clear all items from cart?')) {
        clearCart();
        toast.success('Cart cleared');
        barcodeInputRef.current?.focus();
      }
    }
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <BillingHeader />

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
        {/* Left Panel - Cart */}
        <div className="lg:col-span-2 flex flex-col space-y-4 overflow-hidden">
          {/* Customer Section */}
          <CustomerSection />

          {/* Barcode Input */}
          <BarcodeInput ref={barcodeInputRef} onSearchClick={() => setSearchOpen(true)} />

          {/* Cart Table */}
          <CartTable />
        </div>

        {/* Right Panel - Totals & Actions */}
        <div className="flex flex-col space-y-4">
          <TotalsPanel />
          <QuickActions
            onSave={handleSave}
            onClear={handleClear}
            saving={saving}
            disabled={items.length === 0}
          />
        </div>
      </div>

      {/* Product Search Dialog */}
      <ProductSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Invoice Dialog */}
      {savedSale && (
        <InvoiceDialog
          sale={savedSale}
          open={invoiceOpen}
          onOpenChange={setInvoiceOpen}
        />
      )}
    </div>
  );
}