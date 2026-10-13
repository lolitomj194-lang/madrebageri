import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { unitPrice } from "@/lib/pricing";
import { ProductsTable } from "@/components/admin/ProductsTable";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { AdminPageHeader } from "@/components/admin/ui";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ include: { category: true }, orderBy: [{ category: { order: "asc" } }, { order: "asc" }, { name: "asc" }] }),
    prisma.category.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { products: true } } } }),
  ]);
  const rows = products.map((p) => ({
    id: p.id,
    name: p.name,
    categoryName: p.category.name,
    unitLabel: p.unitLabel,
    unitPrice: unitPrice(p),
    pricePerKg: p.pricePerKg,
    priceMode: p.priceMode,
    saleUnit: p.saleUnit,
    portionMinGrams: p.portionMinGrams,
    portionMaxGrams: p.portionMaxGrams,
    active: p.active,
    featured: p.featured,
    tier: p.tier,
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Productos"
        subtitle={`${products.length} productos · ${products.filter((p) => p.active).length} disponibles`}
        action={<Link href="/admin/productos/nuevo" className="btn btn-primary btn-sm">+ Nuevo producto</Link>}
      />
      <CategoryManager categories={categories} />
      <ProductsTable products={rows} />
    </div>
  );
}
