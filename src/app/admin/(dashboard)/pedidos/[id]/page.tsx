import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBusinessSettings } from "@/lib/settings";
import { formatPrice, formatOrderNumber, formatDateTime, formatIsoDate } from "@/lib/format";
import { DELIVERY_LABEL } from "@/lib/order-status";
import { whatsappLink, formatArPhone } from "@/lib/whatsapp";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { OrderAdminControls } from "@/components/admin/OrderAdminControls";
import { AdminPageHeader } from "@/components/admin/ui";

export const revalidate = 0;

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({ where: { id }, include: { items: true, zone: true } }),
    getBusinessSettings(),
  ]);
  if (!order) notFound();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const trackingUrl = `${baseUrl}/pedido/${order.publicToken}`;
  const customerMsg = `Hola ${order.customerName.split(" ")[0]}! Te escribimos de ${settings.name} por tu pedido #${formatOrderNumber(order.number)}.`;
  const previousCount = await prisma.order.count({ where: { phone: order.phone, id: { not: order.id } } });

  return (
    <div>
      <AdminPageHeader
        title={`Pedido #${formatOrderNumber(order.number)}`}
        subtitle={`Solicitado el ${formatDateTime(order.createdAt)}`}
        action={<OrderStatusSelect orderId={order.id} status={order.status} />}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-brand-line bg-white p-5">
            <h2 className="font-display text-xl uppercase">Cliente</h2>
            <p className="mt-2 font-medium">{order.customerName}</p>
            <p className="text-sm text-brand-ash">{formatArPhone(order.phone)} · {previousCount > 0 ? `${previousCount} pedido${previousCount > 1 ? "s" : ""} anterior${previousCount > 1 ? "es" : ""}` : "primer pedido"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={whatsappLink(order.phone, customerMsg)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm">Abrir chat de WhatsApp</a>
              <Link href={`/admin/pedidos?telefono=${order.phone}`} className="btn btn-outline btn-sm">Ver historial</Link>
              <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">Ver seguimiento ↗</a>
            </div>
          </section>

          <section className="rounded-2xl border border-brand-line bg-white p-5">
            <h2 className="font-display text-xl uppercase">Entrega</h2>
            <p className="mt-2 font-medium">{DELIVERY_LABEL[order.deliveryMethod]}</p>
            {order.deliveryMethod !== "RETIRO" && (
              <div className="text-sm text-brand-smoke">
                <p>{order.address}{order.neighborhood ? `, ${order.neighborhood}` : ""}</p>
                {order.zone && <p className="text-brand-ash">Zona: {order.zone.name}</p>}
                {order.reference && <p className="text-brand-ash">Ref.: {order.reference}</p>}
                {order.mapsLink && <a href={order.mapsLink} target="_blank" rel="noopener noreferrer" className="text-brand-ember underline">Ver en Google Maps</a>}
              </div>
            )}
            {order.requestedDate && <p className="mt-1 text-sm">{formatIsoDate(order.requestedDate)}{order.timeSlot ? `, ${order.timeSlot} hs` : ""}</p>}
            {order.deliveryMethod === "EXPRESS" && <p className="mt-1 text-sm">Lo antes posible.</p>}
            {order.notes && <p className="mt-3 rounded-lg bg-brand-cream px-3 py-2 text-sm">Observaciones del cliente: {order.notes}</p>}
          </section>

          <section className="rounded-2xl border border-brand-line bg-white p-5">
            <h2 className="font-display text-xl uppercase">Productos</h2>
            <ul className="mt-3 divide-y divide-brand-line text-sm">
              {order.items.map((it) => (
                <li key={it.id} className="flex justify-between gap-3 py-2">
                  <span>
                    <span className="font-medium">{it.name}</span>
                    <span className="block text-xs text-brand-ash">{it.detail}</span>
                  </span>
                  <span className="whitespace-nowrap">{formatPrice(it.lineTotal)}{it.estimated && <span className="text-brand-ash"> est.</span>}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1 border-t border-brand-line pt-3 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
              {order.discount > 0 && <div className="flex justify-between text-brand-success"><dt>Descuento {order.couponCode}</dt><dd>- {formatPrice(order.discount)}</dd></div>}
              <div className="flex justify-between"><dt>Envío</dt><dd>{formatPrice(order.deliveryFee)}</dd></div>
              <div className="flex justify-between font-display text-xl"><dt>Total estimado</dt><dd>{formatPrice(order.total)}</dd></div>
            </dl>
          </section>

          {order.whatsappMessage && (
            <details className="rounded-2xl border border-brand-line bg-white p-5">
              <summary className="cursor-pointer font-display text-lg uppercase">Mensaje generado para WhatsApp</summary>
              <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-brand-cream p-3 text-xs">{order.whatsappMessage}</pre>
            </details>
          )}
        </div>

        <OrderAdminControls orderId={order.id} finalTotal={order.finalTotal} paid={Boolean(order.paidAt)} adminNotes={order.adminNotes} />
      </div>
    </div>
  );
}
