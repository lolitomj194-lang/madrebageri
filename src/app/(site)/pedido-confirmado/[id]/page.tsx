import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5493435173734";

export const revalidate = 0;

export default async function PedidoConfirmadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const waMessage = encodeURIComponent(
    `Hola! Quiero confirmar mi pedido #${order.id.slice(-8).toUpperCase()} por ${formatPrice(order.total)} (${
      order.paymentMethod === "TRANSFERENCIA"
        ? "pago por transferencia"
        : order.paymentMethod === "EFECTIVO"
          ? "pago en efectivo"
          : "Mercado Pago"
    }).`
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold/15 text-3xl text-brand-gold">
        ✓
      </div>
      <h1 className="font-serif text-3xl text-brand-ink">Pedido recibido</h1>
      <p className="mt-3 text-brand-ink/70">
        Numero de pedido <span className="font-semibold text-brand-ink">#{order.id.slice(-8).toUpperCase()}</span>
      </p>

      <div className="mt-8 rounded-2xl border border-brand-line bg-white p-6 text-left">
        <ul className="space-y-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span>
                {item.productName} <span className="text-brand-ink/50">({item.variantLabel})</span> x{item.quantity}
              </span>
              <span className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-brand-line pt-4 font-serif text-lg">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      {order.paymentMethod === "TRANSFERENCIA" && (
        <div className="mt-6 rounded-2xl bg-brand-cream p-6 text-left text-sm text-brand-ink/80">
          <p className="font-medium text-brand-ink mb-2">Como continuar con tu pago:</p>
          <p>Escribinos por WhatsApp y te pasamos los datos bancarios para la transferencia. Apenas confirmemos el pago, preparamos tu pedido.</p>
        </div>
      )}
      {order.paymentMethod === "EFECTIVO" && (
        <div className="mt-6 rounded-2xl bg-brand-cream p-6 text-left text-sm text-brand-ink/80">
          <p className="font-medium text-brand-ink mb-2">Pago en efectivo</p>
          <p>Coordinamos por WhatsApp el retiro en el local (zona Hipodromo, Parana) y abonas en el momento.</p>
        </div>
      )}
      {order.paymentMethod === "MERCADOPAGO" && (
        <div className="mt-6 rounded-2xl bg-brand-cream p-6 text-left text-sm text-brand-ink/80">
          <p>Te vamos a avisar por WhatsApp apenas confirmemos el pago y preparemos tu pedido.</p>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a
          href={`https://wa.me/${WHATSAPP}?text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-[#25D366] px-8 py-3 text-sm font-medium text-white"
        >
          Confirmar por WhatsApp
        </a>
        <Link href="/catalogo" className="rounded-full border border-brand-line px-8 py-3 text-sm text-brand-ink hover:border-brand-gold">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
