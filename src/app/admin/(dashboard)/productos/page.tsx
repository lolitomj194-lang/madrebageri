import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminProductsTable } from "@/components/admin/AdminProductsTable";
import { BulkPriceUpdate } from "@/components/admin/BulkPriceUpdate";
import { CategoryQuickAdd } from "@/components/admin/CategoryQuickAdd";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: { orderBy: { order: "asc" } },
      variants: { orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl text-brand-ink">Productos</h1>
        <Link href="/admin/productos/nuevo" className="btn-primary">
          + Nuevo producto
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <BulkPriceUpdate />
        <CategoryQuickAdd />
      </div>

      <AdminProductsTable products={products} />
    </div>
  );
}
