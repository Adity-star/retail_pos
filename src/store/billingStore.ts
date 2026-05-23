// src/store/billingStore.ts

import { create } from 'zustand';
import { Product } from '@prisma/client';

export interface CartItem {
  id: string;
  productId: string;
  barcode: string;
  sku: string;
  name: string;
  quantity: number;
  rate: number;
  discountPercent: number;
  discountAmount: number;
  amount: number;
}

interface CustomerDetails {
  name: string;
  class: string;
  mobile: string;
}

interface BillingState {
  // Cart
  items: CartItem[];
  
  // Customer
  customer: CustomerDetails;
  
  // Totals
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  totalAmount: number;
  
  // Payment
  paymentMode: 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER';
  
  // Actions
  addItem: (product: Product) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItemDiscount: (id: string, discountPercent: number) => void;
  removeItem: (id: string) => void;
  setCustomer: (customer: Partial<CustomerDetails>) => void;
  setDiscountPercent: (percent: number) => void;
  setPaymentMode: (mode: 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER') => void;
  clearCart: () => void;
  recalculateTotals: () => void;
}

export const useBillingStore = create<BillingState>((set, get) => ({
  // Initial state
  items: [],
  customer: {
    name: 'Cash Account',
    class: '',
    mobile: '',
  },
  subtotal: 0,
  discountPercent: 0,
  discountAmount: 0,
  totalAmount: 0,
  paymentMode: 'CASH',

  // Add item to cart
  addItem: (product) => {
    const { items } = get();
    const existingItem = items.find((item) => item.productId === product.id);

    if (existingItem) {
      // Increment quantity
      get().updateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      // Add new item
      const newItem: CartItem = {
        id: crypto.randomUUID(),
        productId: product.id,
        barcode: product.barcode,
        sku: product.sku,
        name: product.name,
        quantity: 1,
        rate: Number(product.sellingPrice),
        discountPercent: 0,
        discountAmount: 0,
        amount: Number(product.sellingPrice),
      };

      set({ items: [...items, newItem] });
    }

    get().recalculateTotals();
  },

  // Update item quantity
  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }

    const { items } = get();
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const itemSubtotal = item.rate * quantity;
        const itemDiscount = (itemSubtotal * item.discountPercent) / 100;
        return {
          ...item,
          quantity,
          discountAmount: itemDiscount,
          amount: itemSubtotal - itemDiscount,
        };
      }
      return item;
    });

    set({ items: updatedItems });
    get().recalculateTotals();
  },

  // Update item discount
  updateItemDiscount: (id, discountPercent) => {
    const { items } = get();
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const itemSubtotal = item.rate * item.quantity;
        const itemDiscount = (itemSubtotal * discountPercent) / 100;
        return {
          ...item,
          discountPercent,
          discountAmount: itemDiscount,
          amount: itemSubtotal - itemDiscount,
        };
      }
      return item;
    });

    set({ items: updatedItems });
    get().recalculateTotals();
  },

  // Remove item
  removeItem: (id) => {
    const { items } = get();
    set({ items: items.filter((item) => item.id !== id) });
    get().recalculateTotals();
  },

  // Set customer details
  setCustomer: (customer) => {
    set((state) => ({
      customer: { ...state.customer, ...customer },
    }));
  },

  // Set global discount
  setDiscountPercent: (percent) => {
    set({ discountPercent: percent });
    get().recalculateTotals();
  },

  // Set payment mode
  setPaymentMode: (mode) => {
    set({ paymentMode: mode });
  },

  // Clear cart
  clearCart: () => {
    set({
      items: [],
      customer: {
        name: 'Cash Account',
        class: '',
        mobile: '',
      },
      subtotal: 0,
      discountPercent: 0,
      discountAmount: 0,
      totalAmount: 0,
      paymentMode: 'CASH',
    });
  },

  // Recalculate totals
  recalculateTotals: () => {
    const { items, discountPercent } = get();

    // Calculate subtotal (after item-level discounts)
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

    // Calculate global discount
    const globalDiscount = (subtotal * discountPercent) / 100;

    // Calculate total
    const totalAmount = subtotal - globalDiscount;

    set({
      subtotal,
      discountAmount: globalDiscount,
      totalAmount,
    });
  },
}));