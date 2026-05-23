// src/app/dashboard/inventory/stock-report/page.tsx

import { requireUser } from '@/lib/auth/require-user';
import { db } from '@/lib/db';

async function getStockReport(tenantId: string) {
  const products = await db.product.findMany({
    where: {
      tenantId,
      isActive: true,
    },
    include: {
      category: true,
    },
    orderBy: {
      stock: 'asc',
    },
  });

  const lowStock = products.filter(
    (p) => p.stock <= p.minStockLevel
  );
  const outOfStock = products.filter((p) => p.stock === 0);

  return {
    products,
    lowStock,
    outOfStock,
  };
}

export default async function StockReportPage() {
  const user = await requireUser();
  const { products, lowStock, outOfStock } = await getStockReport(user.tenantId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Stock Report</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor inventory levels and stock alerts
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {products.length}
          </p>
        </div>
        <div className="p-6 bg-orange-50 rounded-lg border border-orange-200 shadow-sm">
          <h3 className="text-sm font-medium text-orange-600">Low Stock</h3>
          <p className="text-3xl font-bold text-orange-700 mt-2">
            {lowStock.length}
          </p>
        </div>
        <div className="p-6 bg-red-50 rounded-lg border border-red-200 shadow-sm">
          <h3 className="text-sm font-medium text-red-600">Out of Stock</h3>
          <p className="text-3xl font-bold text-red-700 mt-2">
            {outOfStock.length}
          </p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Low Stock Alert
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {lowStock.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      SKU: {product.sku} | Barcode: {product.barcode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-600">
                      {product.stock}
                    </p>
                    <p className="text-xs text-gray-500">
                      Min: {product.minStockLevel}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Products Stock */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            All Products Stock
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Stock
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Min Level
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {product.category?.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                    {product.stock}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-right">
                    {product.minStockLevel}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {product.stock === 0 ? (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                        Out of Stock
                      </span>
                    ) : product.stock <= product.minStockLevel ? (
                      <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        In Stock
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
