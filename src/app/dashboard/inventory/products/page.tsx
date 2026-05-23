// src/app/(dashboard)/inventory/products/page.tsx

import { getTenantContext } from '@/lib/tenant';
import { ProductService } from '@/services/productService';
import { CategoryService } from '@/services/categoryService';
import ProductsTable from '@/components/inventory/ProductsTable';
import ProductsHeader from '@/components/inventory/ProductsHeader';

export default async function ProductsPage() {
  const { tenantId } = await getTenantContext();
  const [products, categories] = await Promise.all([
    ProductService.getProducts(tenantId),
    CategoryService.getCategories(tenantId),
  ]);

  return (
    <div className="space-y-6">
      <ProductsHeader categories={categories} />
      <ProductsTable initialProducts={products} categories={categories} />
    </div>
  );
}