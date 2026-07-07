import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminProductsTable } from "@/components/admin/AdminProductsTable";

export const revalidate = 0;

export default async function AdminProductosPage() {
  const products = await prisma.product.findMany({
    include: { category: true, images: { orderBy: { order: "asc" } }, variants: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-brand-ink">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-full bg-brand-ink px-6 py-2 text-sm uppercase tracking-wide text-brand-cream hover:bg-brand-gold hover:text-brand-ink transition-colors"
        >
          + Nuevo producto
        </Link>
      </div>
      <AdminProductsTable products={products} />
    </div>
  );
}
