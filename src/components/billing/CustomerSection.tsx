// src/components/billing/CustomerSection.tsx

'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBillingStore } from '@/store/billingStore';

export default function CustomerSection() {
  const { customer, paymentMode, setCustomer, setPaymentMode } = useBillingStore();

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">Customer Name</Label>
          <Input
            id="customerName"
            value={customer.name}
            onChange={(e) => setCustomer({ name: e.target.value })}
            placeholder="Cash Account"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerClass">Class</Label>
          <Input
            id="customerClass"
            value={customer.class}
            onChange={(e) => setCustomer({ class: e.target.value })}
            placeholder="Grade 5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerMobile">Mobile</Label>
          <Input
            id="customerMobile"
            value={customer.mobile}
            onChange={(e) => setCustomer({ mobile: e.target.value })}
            placeholder="9876543210"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentMode">Payment Mode</Label>
          <Select value={paymentMode} onValueChange={setPaymentMode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="CARD">Card</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}