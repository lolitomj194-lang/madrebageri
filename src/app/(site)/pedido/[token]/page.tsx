import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBusinessSettings } from "@/lib/settings";
import { formatPrice, formatOrderNumber, formatDateTime, formatIsoDate } from "@/lib/format";
import { statusInfo, statusTimeline, DELIVERY_LABEL } from "@/lib/order-status";
import { whatsappLink } from "@/lib/whatsapp";
import { OrderActions } from "@/components/OrderActions";

export const revalidate = 0;

export const metadata: Metadata = { title: "Seguimiento de pedido", robots: { index: false, follow: false } };

export default async function OrderTrackingPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ nuevo?: string }>;
}) {
  const { token } = await params;
  const { nuevo } = await searchParams;
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({ where: { publicToken: token }, include: { items: true, zone: true } }),
    getBusinessSettings(),
  ]);
  if (!order) notFound();

  const info = statusInfo(order.status);
  const timeline = statusTimeline(order.deliveryMethod);
  const currentIdx = timeline.indexOf(order.status);
  const cancelled = order.status === "CANCELADO";
  const waUrl = settings.whatsapp && order.whatsappMessage ? whatsappLink(settings.whatsapp, order.whatsappMessage) : null;
  const isNew = nuevo === "1";
  const pending = ["SOLICITADA", "PENDIENTE_CONTACTO", "PENDIENTE_CONFIRMACION"].includes(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {isNew && (
        <div className="mb-8 rounded-2xl border border-brand-whatsapp/40 bg-emerald-50 p-6">
          <p className="eyebrow text-emerald-700">Solicitud registrada</p>
          <h1 className="section-title mt-1 text-4xl text-brand-carbon">¡Falta un paso!</h1>
          <p className="mt-2 text-sm text-brand-smoke">
            Registramos tu solicitud <strong>#{formatOrderNumber(order.number)}</strong>. Si WhatsApp no se abrió automáticamente, tocá el botón para enviarnos el pedido.{" "}
            <strong>Tu pedido no está confirmado hasta que lo acordemos por chat.</strong>
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Pedido</p>
          <h2 className="font-display text-4xl text-brand-carbon">#{formatOrderNumber(order.number)}</h2>
          <p className="mt-1 text-xs text-brand-ash">Solicitado el {formatDateTime(order.createdAt)}</p>
        </div>
        <span className={`badge ${info.tone}`}>{info.label}</span>
      </div>
      <p className="mt-3 text-sm text-brand-smoke">{info.description}</p>

      <OrderActions orderNumber={formatOrderNumber(order.number)} whatsappUrl={waUrl} token={token} whatsappConfigured={Boolean(settings.whatsapp)} />

      {/* Timeline */}
      {!cancelled && (
        <ol className="mt-8 grid gap-2 sm:grid-cols-5">
          {timeline.map((s, i) => {
            const done = currentIdx >= i || (pending && i === 0);
            const active = order.status === s || (pending && i === 0);
            return (
              <li key={s} className={`rounded-xl border px-3 py-2 text-xs ${active ? "border-brand-ember bg-brand-ember/5" : done ? "border-brand-line bg-brand-cream-dark/60" : "border-brand-line"}`}>
                <span className={`block font-semibold ${done ? "text-brand-carbon" : "text-brand-ash"}`}>{statusInfo(s).label}</span>
              </li>
            );
          })}
        </ol>
      )}

      {/* Detalle */}
      <section className="mt-8 rounded-2xl border border-brand-line bg-white p-6">
        <h3 className="font-display text-xl uppercase text-brand-carbon">Productos</h3>
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
          {order.deliveryMethod !== "RETIRO" && <div className="flex justify-between"><dt>Envío</dt><dd>{order.deliveryFee ? formatPrice(order.deliveryFee) : "Sin cargo"}</dd></div>}
          <div className="flex justify-between font-display text-xl"><dt>Total estimado</dt><dd>{formatPrice(order.total)}</dd></div>
          {order.finalTotal !== null && (
            <div className="flex justify-between font-display text-xl text-brand-success"><dt>Total confirmado</dt><dd>{formatPrice(order.finalTotal)}</dd></div>
          )}
        </dl>
      </section>

      <section className="mt-6 grid gap-6 rounded-2xl border border-brand-line bg-white p-6 text-sm sm:grid-cols-2">
        <div>
          <h3 className="font-display text-xl uppercase text-brand-carbon">Entrega</h3>
          <p className="mt-2 font-medium">{DELIVERY_LABEL[order.deliveryMethod]}</p>
          {order.deliveryMethod === "RETIRO" ? (
            <p className="text-brand-ash">{settings.address || "Dirección del local a confirmar"}</p>
          ) : (
            <p className="text-brand-ash">{[order.address, order.neighborhood].filter(Boolean).join(", ")}{order.zone ? ` · ${order.zone.name}` : ""}</p>
          )}
          {order.requestedDate && <p className="text-brand-ash">{formatIsoDate(order.requestedDate)}{order.timeSlot ? `, ${order.timeSlot} hs` : ""}</p>}
          {order.deliveryMethod === "EXPRESS" && <p className="text-brand-ash">Lo antes posible, sujeto a confirmación.</p>}
        </div>
        <div>
          <h3 className="font-display text-xl uppercase text-brand-carbon">Contacto</h3>
          <p className="mt-2">{order.customerName}</p>
          {order.notes && <p className="mt-2 text-brand-ash">Observaciones: {order.notes}</p>}
        </div>
      </section>

      <p className="mt-6 text-center text-xs text-brand-ash">
        Guardá este enlace para seguir el estado de tu pedido. <Link href="/" className="underline">Volver al inicio</Link>
      </p>
    </div>
  );
}
