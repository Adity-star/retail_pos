// src/app/dashboard/inventory/products/page.tsx

import { requireUser } from '@/lib/auth/require-user';
import { db } from '@/lib/db';
import ProductsTable from '@/components/inventory/ProductsTable';
import ProductsHeader from '@/components/inventory/ProductHeader';

async function getProducts(tenantId: string) {
  return await db.product.findMany({
    where: {
      tenantId,
      isActive: true,
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async function getCategories(tenantId: string) {
  return await db.category.findMany({
    where: {
      tenantId,
    },
    orderBy: {
      name: 'asc',
    },
  });
}

export default async function ProductsPage() {
  const user = await requireUser();
  const [products, categories] = await Promise.all([
    getProducts(user.tenantId),
    getCategories(user.tenantId),
  ]);

  return (
    <div className="space-y-6">
      <ProductsHeader categories={categories} />
      <ProductsTable initialProducts={products} categories={categories} />
    </div>
  );
}