import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getBusinessSettings } from "@/lib/settings";
import { formatPrice, formatOrderNumber, formatDateTime } from "@/lib/format";
import { nowInArgentina } from "@/lib/hours";
import { statusInfo } from "@/lib/order-status";
import { AdminPageHeader, Notice } from "@/components/admin/ui";

export const revalidate = 0;

function Stat({ label, value, hint, href }: { label: string; value: string | number; hint?: string; href?: string }) {
  const body = (
    <div className="rounded-2xl border border-brand-line bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-ash">{label}</p>
      <p className="mt-1 font-display text-3xl text-brand-carbon">{value}</p>
      {hint && <p className="text-xs text-brand-ash">{hint}</p>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export default async function AdminDashboard() {
  const settings = await getBusinessSettings();
  const { date: today } = nowInArgentina();
  // Inicio del dia en Argentina (UTC-3).
  const startOfDay = new Date(`${today}T00:00:00-03:00`);

  const [todayCount, byStatus, confirmedAgg, paidAgg, topItems, recent, productCount] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.findMany({
      where: { status: { in: ["CONFIRMADO", "EN_PREPARACION", "LISTO_PARA_RETIRAR", "EN_REPARTO", "ENTREGADO"] } },
      select: { total: true, finalTotal: true },
    }),
    prisma.order.findMany({ where: { paidAt: { not: null } }, select: { total: true, finalTotal: true } }),
    prisma.orderItem.groupBy({
      by: ["name"],
      _sum: { quantity: true },
      _count: { _all: true },
      where: { order: { status: { not: "CANCELADO" } } },
      orderBy: { _count: { name: "desc" } },
      take: 8,
    }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.product.count(),
  ]);

  const count = (s: string) => byStatus.find((b) => b.status === s)?._count._all ?? 0;
  const confirmedSales = confirmedAgg.reduce((s, o) => s + (o.finalTotal ?? o.total), 0);
  const paidTotal = paidAgg.reduce((s, o) => s + (o.finalTotal ?? o.total), 0);
  const avgTicket = confirmedAgg.length ? Math.round(confirmedSales / confirmedAgg.length) : 0;
  const pending = count("SOLICITADA") + count("PENDIENTE_CONTACTO") + count("PENDIENTE_CONFIRMACION");

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Dashboard" subtitle={`Hoy ${today}`} />

      {!settings.whatsapp && (
        <Notice tone="warn">
          Todavía no cargaste el <strong>número de WhatsApp comercial</strong>. Los clientes no podrán enviar el pedido por WhatsApp hasta que lo configures en{" "}
          <Link href="/admin/configuracion" className="underline">Configuración</Link>.
        </Notice>
      )}
      {productCount > 0 && (
        <Notice tone="info">
          Recordá que los productos y precios cargados por el seed son <strong>datos de ejemplo</strong>: revisalos en <Link href="/admin/productos" className="underline">Productos</Link> antes de publicar.
        </Notice>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Solicitudes de hoy" value={todayCount} href="/admin/pedidos" />
        <Stat label="Pendientes" value={pending} hint="Solicitadas / sin confirmar" href="/admin/pedidos?estado=SOLICITADA" />
        <Stat label="Confirmados" value={count("CONFIRMADO")} href="/admin/pedidos?estado=CONFIRMADO" />
        <Stat label="En preparación" value={count("EN_PREPARACION")} href="/admin/pedidos?estado=EN_PREPARACION" />
        <Stat label="En reparto" value={count("EN_REPARTO")} href="/admin/pedidos?estado=EN_REPARTO" />
        <Stat label="Entregados" value={count("ENTREGADO")} href="/admin/pedidos?estado=ENTREGADO" />
        <Stat label="Ventas confirmadas" value={formatPrice(confirmedSales)} hint="Pedidos confirmados o posteriores (precio final si existe)" />
        <Stat label="Cobros recibidos" value={formatPrice(paidTotal)} hint="Marcados como cobrados" />
        <Stat label="Ticket promedio" value={formatPrice(avgTicket)} hint="Sobre ventas confirmadas" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-brand-line bg-white p-5">
          <h2 className="font-display text-xl uppercase">Últimas solicitudes</h2>
          <ul className="mt-3 divide-y divide-brand-line text-sm">
            {recent.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 py-2">
                <Link href={`/admin/pedidos/${o.id}`} className="min-w-0">
                  <span className="font-semibold text-brand-ember">#{formatOrderNumber(o.number)}</span> {o.customerName}
                  <span className="block text-xs text-brand-ash">{formatDateTime(o.createdAt)} · {formatPrice(o.total)}</span>
                </Link>
                <span className={`badge ${statusInfo(o.status).tone}`}>{statusInfo(o.status).label}</span>
              </li>
            ))}
            {recent.length === 0 && <li className="py-4 text-brand-ash">Todavía no hay solicitudes.</li>}
          </ul>
        </section>
        <section className="rounded-2xl border border-brand-line bg-white p-5">
          <h2 className="font-display text-xl uppercase">Productos más solicitados</h2>
          <ul className="mt-3 divide-y divide-brand-line text-sm">
            {topItems.map((t) => (
              <li key={t.name} className="flex justify-between py-2">
                <span>{t.name}</span>
                <span className="text-brand-ash">{t._count._all} pedidos · {t._sum.quantity ?? 0} unidades</span>
              </li>
            ))}
            {topItems.length === 0 && <li className="py-4 text-brand-ash">Sin datos todavía.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
