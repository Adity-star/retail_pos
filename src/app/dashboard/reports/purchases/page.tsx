// src/app/dashboard/reports/purchases/page.tsx

import { requireUser } from '@/lib/auth/require-user';

export default async function PurchasesReportPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Purchase Report</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track purchase history and supplier data
        </p>
      </div>
      <div className="p-12 text-center bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">Purchase report coming soon</p>
      </div>
    </div>
  );
}
