// src/app/dashboard/reports/profit/page.tsx

import { requireUser } from '@/lib/auth/require-user';

export default async function ProfitReportPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profit Report</h1>
        <p className="text-sm text-gray-500 mt-1">
          Analyze profit margins and revenue
        </p>
      </div>
      <div className="p-12 text-center bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">Profit report coming soon</p>
      </div>
    </div>
  );
}
