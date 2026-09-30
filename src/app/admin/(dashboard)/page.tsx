import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [pendingOrders, totalProducts, lowStockVariants, monthSales] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { active: true } }),
    prisma.variant.findMany({
      where: { stock: { lte: 2 }, active: true, product: { active: true } },
      include: { product: true },
      orderBy: { stock: "asc" },
      take: 10,
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ["PAID", "PREPARING", "SHIPPED", "DELIVERED"] },
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl text-brand-ink">Resumen</h1>
        <Link href="/admin/productos/nuevo" className="btn-primary">
          + Nuevo producto
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/admin/pedidos" className="rounded-2xl border border-brand-line bg-white p-6 hover:border-brand-terracotta">
          <p className="text-xs uppercase tracking-wide text-brand-ink/50">Pedidos pendientes</p>
          <p className="mt-2 font-serif text-3xl text-brand-ink">{pendingOrders}</p>
        </Link>
        <div className="rounded-2xl border border-brand-line bg-white p-6">
          <p className="text-xs uppercase tracking-wide text-brand-ink/50">Ventas del mes</p>
          <p className="mt-2 font-serif text-3xl text-brand-ink">{formatPrice(monthSales._sum.total ?? 0)}</p>
        </div>
        <Link href="/admin/productos" className="rounded-2xl border border-brand-line bg-white p-6 hover:border-brand-terracotta">
          <p className="text-xs uppercase tracking-wide text-brand-ink/50">Productos activos</p>
          <p className="mt-2 font-serif text-3xl text-brand-ink">{totalProducts}</p>
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-brand-line bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-lg text-brand-ink">Telas por agotarse</h2>
          <Link href="/admin/productos" className="text-sm text-brand-terracotta hover:underline">
            Ver productos
          </Link>
        </div>
        {lowStockVariants.length === 0 ? (
          <p className="text-sm text-brand-ink/60">Todo el stock está en buen nivel.</p>
        ) : (
          <ul className="divide-y divide-brand-line">
            {lowStockVariants.map((v) => (
              <li key={v.id} className="flex items-center justify-between py-3 text-sm">
                <Link href={`/admin/productos/${v.productId}`} className="hover:text-brand-terracotta">
                  {v.product.name} <span className="text-brand-ink/50">({v.name})</span>
                </Link>
                <span className={v.stock === 0 ? "font-semibold text-red-600" : "font-semibold text-amber-600"}>
                  {v.stock} u.
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
