import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { site, whatsappLink } from "@/lib/site";
import { PAYMENT_LABELS, SHIPPING_LABELS } from "@/lib/order-types";

export const dynamic = "force-dynamic";

export default async function OrderConfirmedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) notFound();

  const shortId = order.id.slice(-6).toUpperCase();
  const whatsappMessage = `Hola ${site.name}! Hice el pedido #${shortId} a nombre de ${order.customerName}. Te escribo para coordinar ${
    order.paymentMethod === "MERCADOPAGO" ? "el envío" : "el pago y el envío"
  }.`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <div className="rounded-3xl border border-brand-line bg-white p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-sage/20">
          <svg className="h-7 w-7 text-brand-sage-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="mt-4 font-serif text-3xl text-brand-ink">¡Pedido recibido!</h1>
        <p className="mt-2 text-brand-ink-soft">
          Tu pedido <strong>#{shortId}</strong> quedó registrado.
        </p>

        <div className="mt-6 space-y-2 rounded-2xl bg-brand-cream p-5 text-left text-sm">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-2">
              <span className="text-brand-ink-soft">
                {item.quantity}× {item.productName}
                {item.variantLabel && <span className="text-xs"> ({item.variantLabel})</span>}
              </span>
              <span className="shrink-0 font-medium">{formatPrice(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-brand-line pt-2 font-semibold text-brand-ink">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
          <p className="text-xs text-brand-ink-soft">
            Pago: {PAYMENT_LABELS[order.paymentMethod]} · Entrega: {SHIPPING_LABELS[order.shippingMethod]}
          </p>
        </div>

        <div className="mt-6 space-y-3 text-sm text-brand-ink-soft">
          {order.paymentMethod === "TRANSFERENCIA" && (
            <p>
              Escribinos por WhatsApp y te pasamos el alias para la
              transferencia. Tu pedido queda reservado.
            </p>
          )}
          {order.paymentMethod === "EFECTIVO" && (
            <p>Escribinos por WhatsApp para coordinar la entrega y el pago.</p>
          )}
          {order.shippingMethod === "ENVIO_NACIONAL" && (
            <p>El costo del envío lo coordinamos por WhatsApp según tu destino.</p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href={whatsappLink(whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Coordinar por WhatsApp
          </a>
          <Link href="/catalogo" className="btn-secondary">
            Seguir mirando
          </Link>
        </div>
      </div>
    </div>
  );
}
