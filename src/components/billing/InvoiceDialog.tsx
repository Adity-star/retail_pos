// src/components/billing/InvoiceDialog.tsx

'use client';

import { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Printer, Download, X } from 'lucide-react';
import { format } from 'date-fns';

interface InvoiceDialogProps {
  sale: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InvoiceDialog({
  sale,
  open,
  onOpenChange,
}: InvoiceDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    printWindow.document.write('<html><head><title>Invoice</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; padding: 20px; }
      .invoice { max-width: 800px; margin: 0 auto; }
      .header { text-align: center; margin-bottom: 30px; }
      .header h1 { margin: 0; font-size: 24px; }
      .info { display: flex; justify-content: space-between; margin-bottom: 20px; }
      .info div { flex: 1; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
      th { background-color: #f5f5f5; }
      .text-right { text-align: right; }
      .totals { margin-top: 20px; }
      .totals div { display: flex; justify-content: space-between; padding: 5px 0; }
      .total { font-size: 18px; font-weight: bold; }
      @media print {
        button { display: none; }
      }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice #{sale.billNo}</span>
            <div className="flex items-center gap-2">
              <Button onClick={handlePrint} variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button onClick={() => onOpenChange(false)} variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold">Just Uniform ERP</h1>
            <p className="text-sm text-gray-600">School Uniform Shop</p>
            <p className="text-sm text-gray-600">Tax Invoice</p>
          </div>

          <Separator />

          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <p className="font-medium">{sale.customerName}</p>
              {sale.customerClass && <p className="text-sm">Class: {sale.customerClass}</p>}
              {sale.customerMobile && <p className="text-sm">Mobile: {sale.customerMobile}</p>}
            </div>
            <div className="text-right">
              <p className="text-sm">
                <span className="font-medium">Invoice No:</span> {sale.billNo}
              </p>
              <p className="text-sm">
                <span className="font-medium">Date:</span>{' '}
                {format(new Date(sale.billDate), 'dd MMM yyyy, hh:mm a')}
              </p>
              <p className="text-sm">
                <span className="font-medium">Payment:</span> {sale.paymentMode}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">#</th>
                <th className="text-left py-2">Product</th>
                <th className="text-right py-2">Rate</th>
                <th className="text-center py-2">Qty</th>
                <th className="text-right py-2">Disc%</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item: any, index: number) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2">{index + 1}</td>
                  <td className="py-2">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-gray-500">{item.productBarcode}</p>
                    </div>
                  </td>
                  <td className="text-right py-2">
                    ₹{Number(item.rate).toLocaleString('en-IN')}
                  </td>
                  <td className="text-center py-2">{item.quantity}</td>
                  <td className="text-right py-2">{item.discountPercent}%</td>
                  <td className="text-right py-2">
                    ₹{Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>
                  ₹{Number(sale.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {sale.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({sale.discountPercent}%):</span>
                  <span>
                    -₹{Number(sale.discountAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span>
                  ₹{Number(sale.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 pt-6 border-t">
            <p>Thank you for your business!</p>
            <p className="text-xs mt-2">This is a computer-generated invoice.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}