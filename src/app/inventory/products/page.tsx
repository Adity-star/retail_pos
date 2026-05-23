import { redirect } from 'next/navigation';

export default function InventoryRoot() {
  redirect('/dashboard/inventory/products');
}
