// src/app/dashboard/page.tsx

import { requireUser } from '@/lib/auth/require-user';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfDay } from 'date-fns';

async function getDashboardMetrics(tenantId: string) {
  const today = startOfDay(new Date());
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  // Today's sales
  const todaySales = await db.sale.aggregate({
    where: {
      tenantId,
      billDate: {
        gte: today,
      },
      isReturn: false,
    },
    _sum: {
      totalAmount: true,
    },
    _count: true,
  });

  // This month's sales
  const monthSales = await db.sale.aggregate({
    where: {
      tenantId,
      billDate: {
        gte: monthStart,
        lte: monthEnd,
      },
      isReturn: false,
    },
    _sum: {
      totalAmount: true,
    },
    _count: true,
  });

  // Low stock products
  const lowStockProducts = await db.product.count({
    where: {
      tenantId,
      isActive: true,
      stock: {
        lte: db.product.fields.minStockLevel,
      },
    },
  });

  // Total products
  const totalProducts = await db.product.count({
    where: {
      tenantId,
      isActive: true,
    },
  });

  // Recent sales
  const recentSales = await db.sale.findMany({
    where: {
      tenantId,
      isReturn: false,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      billDate: 'desc',
    },
    take: 5,
  });

  // Top selling products
  const topProducts = await db.saleItem.groupBy({
    by: ['productId'],
    where: {
      sale: {
        tenantId,
        billDate: {
          gte: monthStart,
        },
        isReturn: false,
      },
    },
    _sum: {
      quantity: true,
      amount: true,
    },
    orderBy: {
      _sum: {
        quantity: 'desc',
      },
    },
    take: 5,
  });

  // Get product details for top products
  const topProductsWithDetails = await Promise.all(
    topProducts.map(async (item) => {
      const product = await db.product.findUnique({
        where: { id: item.productId },
        select: { name: true, barcode: true, stock: true },
      });
      return {
        ...item,
        product,
      };
    })
  );

  return {
    todaySales: {
      amount: todaySales._sum.totalAmount || 0,
      count: todaySales._count,
    },
    monthSales: {
      amount: monthSales._sum.totalAmount || 0,
      count: monthSales._count,
    },
    lowStockProducts,
    totalProducts,
    recentSales,
    topProducts: topProductsWithDetails,
  };
}

export default async function DashboardPage() {
  const user = await requireUser();
  const metrics = await getDashboardMetrics(user.tenantId);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{user.tenant.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Today's Sales
            </CardTitle>
            <DollarSign className="w-4 h-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ₹{metrics.todaySales.amount.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.todaySales.count} transactions
            </p>
          </CardContent>
        </Card>

        {/* Monthly Sales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Monthly Sales
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ₹{metrics.monthSales.amount.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.monthSales.count} transactions
            </p>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics.lowStockProducts}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Requires attention
            </p>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Products
            </CardTitle>
            <Package className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {metrics.totalProducts}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Active inventory
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent sales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.recentSales.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No sales yet
                </p>
              ) : (
                metrics.recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Bill #{sale.billNo}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sale.customerName} • {format(new Date(sale.billDate), 'MMM d, HH:mm')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        ₹{Number(sale.totalAmount).toLocaleString('en-IN')}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {sale.items.length} items
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top selling products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topProducts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No data available
                </p>
              ) : (
                metrics.topProducts.map((item, index) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.product?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Stock: {item.product?.stock || 0}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {item._sum.quantity} sold
                      </p>
                      <p className="text-xs text-gray-500">
                        ₹{Number(item._sum.amount).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}