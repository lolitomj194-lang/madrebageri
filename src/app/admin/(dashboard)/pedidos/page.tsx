import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatOrderNumber, formatDateTime } from "@/lib/format";
import { ORDER_STATUS, DELIVERY_LABEL, ACTIVE_STATUSES } from "@/lib/order-status";
import { whatsappLink, formatArPhone } from "@/lib/whatsapp";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { AdminPageHeader } from "@/components/admin/ui";
import type { OrderStatus } from "@/generated/prisma/enums";

export const revalidate = 0;

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ estado?: string; telefono?: string; q?: string }> }) {
  const { estado, telefono, q } = await searchParams;
  const where: Record<string, unknown> = {};
  if (estado === "activos") where.status = { in: ACTIVE_STATUSES };
  else if (estado && ORDER_STATUS.some((s) => s.value === estado)) where.status = estado as OrderStatus;
  if (telefono) where.phone = telefono;
  if (q) {
    const n = Number(q.replace(/\D/g, ""));
    where.OR = [{ customerName: { contains: q, mode: "insensitive" } }, ...(Number.isFinite(n) && n > 0 ? [{ number: n }] : [])];
  }

  const orders = await prisma.order.findMany({ where, include: { items: true, zone: true }, orderBy: { createdAt: "desc" }, take: 200 });

  const filters = [
    { key: "", label: "Todos" },
    { key: "activos", label: "Activos" },
    ...ORDER_STATUS.map((s) => ({ key: s.value, label: s.label })),
  ];

  return (
    <div>
      <AdminPageHeader title="Pedidos" subtitle={`${orders.length} solicitudes${telefono ? ` del teléfono ${formatArPhone(telefono)}` : ""}`} />
      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Buscar por nombre o número…" className="input-field max-w-xs" />
        {estado && <input type="hidden" name="estado" value={estado} />}
        <button className="btn btn-outline btn-sm" type="submit">Buscar</button>
      </form>
      <div className="scroll-x mb-4 flex gap-2">
        {filters.map((f) => (
          <Link key={f.key} href={f.key ? `/admin/pedidos?estado=${f.key}` : "/admin/pedidos"} className={`chip ${(estado ?? "") === f.key ? "chip-active" : ""}`}>
            {f.label}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-brand-line bg-white">
        <table className="w-full text-sm">
          <thead className="bg-brand-cream text-left text-xs uppercase tracking-wider text-brand-ash">
            <tr>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Entrega</th>
              <th className="px-4 py-3">Productos</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-line align-top">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3">
                  <Link href={`/admin/pedidos/${o.id}`} className="font-semibold text-brand-ember hover:underline">#{formatOrderNumber(o.number)}</Link>
                  <span className="block text-xs text-brand-ash">{formatDateTime(o.createdAt)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium">{o.customerName}</span>
                  <a href={whatsappLink(o.phone)} target="_blank" rel="noopener noreferrer" className="block text-xs text-brand-whatsapp hover:underline">{formatArPhone(o.phone)}</a>
                </td>
                <td className="px-4 py-3 text-xs">
                  <span className="font-medium">{DELIVERY_LABEL[o.deliveryMethod]}</span>
                  {o.address && <span className="block text-brand-ash">{o.address}{o.neighborhood ? `, ${o.neighborhood}` : ""}</span>}
                  {o.requestedDate && <span className="block text-brand-ash">{o.requestedDate} {o.timeSlot}</span>}
                </td>
                <td className="px-4 py-3 text-xs text-brand-smoke">
                  {o.items.slice(0, 4).map((it) => <span key={it.id} className="block">{it.quantity} {it.unitLabel} {it.name}</span>)}
                  {o.items.length > 4 && <span className="text-brand-ash">+{o.items.length - 4} más</span>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatPrice(o.total)}
                  {o.finalTotal !== null && <span className="block text-xs text-brand-success">Final {formatPrice(o.finalTotal)}</span>}
                  {o.paidAt && <span className="block text-xs text-brand-success">Cobrado</span>}
                </td>
                <td className="px-4 py-3"><OrderStatusSelect orderId={o.id} status={o.status} /></td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-brand-ash">No hay pedidos con este filtro.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
