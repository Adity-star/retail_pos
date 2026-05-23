// src/app/(dashboard)/purchase/page.tsx

import { getTenantContext } from '@/lib/tenant';
import { PurchaseService } from '@/services/purchaseService';
import { SupplierService } from '@/services/supplierService';
import PurchaseHeader from '@/components/purchase/PurchaseHeader';
import PurchaseList from '@/components/purchase/PurchaseList';

export default async function PurchasePage() {
  const { tenantId } = await getTenantContext();
  const [purchases, suppliers] = await Promise.all([
    PurchaseService.getPurchases(tenantId),
    SupplierService.getSuppliers(tenantId),
  ]);

  return (
    <div className="space-y-6">
      <PurchaseHeader suppliers={suppliers} />
      <PurchaseList initialPurchases={purchases} suppliers={suppliers} />
    </div>
  );
}