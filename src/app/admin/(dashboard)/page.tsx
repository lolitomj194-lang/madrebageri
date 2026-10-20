import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { getCurrentAdmin } from "@/lib/current-admin";
import { getCostSettings } from "@/lib/cost-settings";
import { computeCost, hasCostData, marginPercent } from "@/lib/costing";
import { CHANNEL_LABELS } from "@/lib/order-types";

export const dynamic = "force-dynamic";

const SOLD_STATUSES = ["PAID", "PREPARING", "SHIPPED", "DELIVERED"] as const;

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const lowStockVariants = await prisma.variant.findMany({
    where: { stock: { lte: 2 }, active: true, product: { active: true } },
    include: { product: true },
    orderBy: { stock: "asc" },
    take: 10,
  });

  if (admin?.role === "STAFF") {
    return (
      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-2xl text-brand-ink">Hola, {admin.name}</h1>
          <Link href="/admin/productos/nuevo" className="btn-primary">
            + Nuevo producto
          </Link>
        </div>
        <LowStockCard variants={lowStockVariants} />
      </div>
    );
  }

  const [pendingWeb, toCollect, monthOrders, products, settings] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING", channel: "WEB" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { status: "PENDING", channel: { not: "WEB" } },
    }),
    prisma.order.findMany({
      where: { status: { in: [...SOLD_STATUSES] }, createdAt: { gte: monthStart } },
      select: { total: true, channel: true },
    }),
    prisma.product.findMany({
      where: { active: true },
      include: { materials: { include: { material: true } } },
    }),
    getCostSettings(),
  ]);

  const monthTotal = monthOrders.reduce((sum, o) => sum + o.total, 0);
  const byChannel = new Map<string, { total: number; count: number }>();
  for (const o of monthOrders) {
    const entry = byChannel.get(o.channel) ?? { total: 0, count: 0 };
    entry.total += o.total;
    entry.count += 1;
    byChannel.set(o.channel, entry);
  }

  const costed = products.filter(hasCostData);
  const belowCost = costed
    .map((p) => {
      const cost = computeCost(p, settings);
      const price = p.wholesalePrice ?? p.cashPrice ?? p.price;
      return { product: p, cost, margin: marginPercent(price, cost.totalCost) };
    })
    .filter((x) => x.margin < 20)
    .sort((a, b) => a.margin - b.margin)
    .slice(0, 8);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl text-brand-ink">Resumen</h1>
        <div className="flex gap-2">
          <Link href="/admin/ventas/nueva" className="btn-primary">
            + Registrar venta
          </Link>
          <Link href="/admin/productos/nuevo" className="btn-secondary">
            + Producto
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-brand-line bg-white p-5">
          <p className="text-xs uppercase tracking-wide text-brand-ink/50">Vendido este mes</p>
          <p className="mt-2 font-serif text-2xl text-brand-ink">{formatPrice(monthTotal)}</p>
          <p className="text-xs text-brand-ink-soft">{monthOrders.length} ventas</p>
        </div>
        <Link href="/admin/ventas?cobro=pendiente" className="rounded-2xl border border-brand-line bg-white p-5 hover:border-brand-terracotta">
          <p className="text-xs uppercase tracking-wide text-brand-ink/50">A cobrar</p>
          <p className="mt-2 font-serif text-2xl text-brand-ink">{formatPrice(toCollect._sum.total ?? 0)}</p>
          <p className="text-xs text-brand-ink-soft">{toCollect._count} ventas fiadas</p>
        </Link>
        <Link href="/admin/ventas?canal=WEB" className="rounded-2xl border border-brand-line bg-white p-5 hover:border-brand-terracotta">
          <p className="text-xs uppercase tracking-wide text-brand-ink/50">Pedidos web pendientes</p>
          <p className="mt-2 font-serif text-2xl text-brand-ink">{pendingWeb}</p>
          <p className="text-xs text-brand-ink-soft">esperando pago/envío</p>
        </Link>
        <Link href="/admin/costos" className="rounded-2xl border border-brand-line bg-white p-5 hover:border-brand-terracotta">
          <p className="text-xs uppercase tracking-wide text-brand-ink/50">Productos costeados</p>
          <p className="mt-2 font-serif text-2xl text-brand-ink">
            {costed.length}/{products.length}
          </p>
          <p className="text-xs text-brand-ink-soft">con receta o minutos cargados</p>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-brand-line bg-white p-6">
          <h2 className="mb-4 font-serif text-lg text-brand-ink">Ventas del mes por canal</h2>
          {byChannel.size === 0 ? (
            <p className="text-sm text-brand-ink/60">Todavía no hay ventas este mes.</p>
          ) : (
            <ul className="divide-y divide-brand-line">
              {[...byChannel.entries()]
                .sort((a, b) => b[1].total - a[1].total)
                .map(([channel, data]) => (
                  <li key={channel} className="flex items-center justify-between py-2.5 text-sm">
                    <span>
                      {CHANNEL_LABELS[channel] ?? channel}{" "}
                      <span className="text-brand-ink/50">({data.count})</span>
                    </span>
                    <span className="font-semibold">{formatPrice(data.total)}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-brand-line bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg text-brand-ink">Margen bajo o negativo</h2>
            <Link href="/admin/costos" className="text-sm text-brand-terracotta hover:underline">
              Ver costos
            </Link>
          </div>
          {costed.length === 0 ? (
            <p className="text-sm text-brand-ink/60">
              Cargá la receta y los minutos de confección en cada producto para ver su margen real.
            </p>
          ) : belowCost.length === 0 ? (
            <p className="text-sm text-brand-ink/60">Todos los productos costeados tienen margen sano (20 %+).</p>
          ) : (
            <ul className="divide-y divide-brand-line">
              {belowCost.map(({ product, cost, margin }) => (
                <li key={product.id} className="flex items-center justify-between py-2.5 text-sm">
                  <Link href={`/admin/productos/${product.id}`} className="hover:text-brand-terracotta">
                    {product.name}
                    <span className="block text-xs text-brand-ink/50">
                      costo {formatPrice(cost.totalCost)}
                    </span>
                  </Link>
                  <span className={`font-semibold ${margin < 0 ? "text-red-600" : "text-amber-600"}`}>
                    {margin}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <LowStockCard variants={lowStockVariants} />
    </div>
  );
}

function LowStockCard({
  variants,
}: {
  variants: { id: string; name: string; stock: number; productId: string; product: { name: string } }[];
}) {
  return (
    <div className="rounded-2xl border border-brand-line bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-lg text-brand-ink">Telas por agotarse</h2>
        <Link href="/admin/productos" className="text-sm text-brand-terracotta hover:underline">
          Ver productos
        </Link>
      </div>
      {variants.length === 0 ? (
        <p className="text-sm text-brand-ink/60">Todo el stock está en buen nivel.</p>
      ) : (
        <ul className="divide-y divide-brand-line">
          {variants.map((v) => (
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
  );
}
