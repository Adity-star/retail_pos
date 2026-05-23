// src/app/dashboard/inventory/categories/page.tsx

import { requireUser } from '@/lib/auth/require-user';
import { db } from '@/lib/db';

async function getCategories(tenantId: string) {
  return await db.category.findMany({
    where: {
      tenantId,
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
}

export default async function CategoriesPage() {
  const user = await requireUser();
  const categories = await getCategories(user.tenantId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage product categories
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No categories found</p>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-gray-500 mt-1">
                  {category.description}
                </p>
              )}
              <p className="text-sm text-gray-600 mt-3">
                {category._count.products} products
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
