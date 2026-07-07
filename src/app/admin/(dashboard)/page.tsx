import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [pendingOrders, totalProducts, lowStockVariants, monthSales] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.count(),
    prisma.productVariant.findMany({
      where: { stock: { lte: 3 } },
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
      <h1 className="font-serif text-2xl text-brand-ink mb-6">Resumen</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-brand-line bg-white p-6">
          <p className="text-xs uppercase tracking-wide text-brand-ink/50">Pedidos pendientes</p>
          <p className="mt-2 font-serif text-3xl text-brand-ink">{pendingOrders}</p>
        </div>
        <div className="rounded-2xl border border-brand-line bg-white p-6">
          <p className="text-xs uppercase tracking-wide text-brand-ink/50">Ventas del mes</p>
          <p className="mt-2 font-serif text-3xl text-brand-ink">{formatPrice(monthSales._sum.total ?? 0)}</p>
        </div>
        <div className="rounded-2xl border border-brand-line bg-white p-6">
          <p className="text-xs uppercase tracking-wide text-brand-ink/50">Productos activos</p>
          <p className="mt-2 font-serif text-3xl text-brand-ink">{totalProducts}</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-brand-line bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg text-brand-ink">Stock bajo</h2>
          <Link href="/admin/productos" className="text-sm text-brand-gold hover:underline">
            Ver productos
          </Link>
        </div>
        {lowStockVariants.length === 0 ? (
          <p className="text-sm text-brand-ink/60">Todo el stock esta en buen nivel.</p>
        ) : (
          <ul className="divide-y divide-brand-line">
            {lowStockVariants.map((v) => (
              <li key={v.id} className="flex items-center justify-between py-3 text-sm">
                <span>
                  {v.product.name} <span className="text-brand-ink/50">({v.colorName})</span>
                </span>
                <span className={v.stock === 0 ? "font-semibold text-brand-ferrari" : "font-semibold text-amber-600"}>
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
