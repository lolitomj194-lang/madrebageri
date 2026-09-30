"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore, cartTotal, itemUnitPrice } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import type { CreateOrderRequest } from "@/lib/order-types";

type PaymentMethod = CreateOrderRequest["paymentMethod"];
type ShippingMethod = CreateOrderRequest["shippingMethod"];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MERCADOPAGO");
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("ENVIO_NACIONAL");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCash = paymentMethod !== "MERCADOPAGO";
  const total = cartTotal(items, isCash);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const body: CreateOrderRequest = {
      customerName: String(form.get("customerName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? "") || undefined,
      shippingMethod,
      address: String(form.get("address") ?? "") || undefined,
      city: String(form.get("city") ?? "") || undefined,
      province: String(form.get("province") ?? "") || undefined,
      postalCode: String(form.get("postalCode") ?? "") || undefined,
      paymentMethod,
      notes: String(form.get("notes") ?? "") || undefined,
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo crear el pedido");
        setSubmitting(false);
        return;
      }
      clear();
      if (data.redirectUrl.startsWith("http")) {
        window.location.href = data.redirectUrl;
      } else {
        router.push(data.redirectUrl);
      }
    } catch {
      setError("Error de conexión. Probá de nuevo.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="font-serif text-2xl text-brand-ink">Tu carrito está vacío</h1>
        <Link href="/catalogo" className="btn-primary">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-serif text-3xl text-brand-ink">Finalizar compra</h1>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {/* Datos */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl text-brand-ink">Tus datos</h2>
            <input name="customerName" required placeholder="Nombre y apellido *" className="input-field" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="phone" required type="tel" placeholder="WhatsApp / teléfono *" className="input-field" />
              <input name="email" type="email" placeholder="Email (opcional)" className="input-field" />
            </div>
          </section>

          {/* Entrega */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl text-brand-ink">Entrega</h2>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className={`option-card ${shippingMethod === "ENVIO_NACIONAL" ? "option-card-active" : ""}`}>
                <input
                  type="radio"
                  name="shipping"
                  className="sr-only"
                  checked={shippingMethod === "ENVIO_NACIONAL"}
                  onChange={() => setShippingMethod("ENVIO_NACIONAL")}
                />
                <span className="font-semibold">Envío a domicilio o sucursal</span>
                <span className="text-brand-ink-soft">
                  A todo el país. El costo se coordina por WhatsApp.
                </span>
              </label>
              <label className={`option-card ${shippingMethod === "RETIRO" ? "option-card-active" : ""}`}>
                <input
                  type="radio"
                  name="shipping"
                  className="sr-only"
                  checked={shippingMethod === "RETIRO"}
                  onChange={() => setShippingMethod("RETIRO")}
                />
                <span className="font-semibold">Retiro / entrega en persona</span>
                <span className="text-brand-ink-soft">Coordinamos día y lugar.</span>
              </label>
            </div>

            {shippingMethod === "ENVIO_NACIONAL" && (
              <div className="space-y-3">
                <input name="address" required placeholder="Dirección (calle y número) *" className="input-field" />
                <div className="grid gap-3 sm:grid-cols-3">
                  <input name="city" required placeholder="Localidad *" className="input-field" />
                  <input name="province" required placeholder="Provincia *" className="input-field" />
                  <input name="postalCode" placeholder="Código postal" className="input-field" />
                </div>
              </div>
            )}
          </section>

          {/* Pago */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl text-brand-ink">Pago</h2>
            <div className="flex flex-col gap-2">
              {(
                [
                  {
                    value: "MERCADOPAGO",
                    title: "Mercado Pago",
                    text: "Tarjeta de crédito, débito o dinero en cuenta. Pagás ahora y queda confirmado.",
                  },
                  {
                    value: "TRANSFERENCIA",
                    title: "Transferencia bancaria",
                    text: "Te pasamos el alias por WhatsApp. Precio con descuento.",
                  },
                  {
                    value: "EFECTIVO",
                    title: "Efectivo",
                    text: "Al retirar o contra entrega según coordinemos. Precio con descuento.",
                  },
                ] as { value: PaymentMethod; title: string; text: string }[]
              ).map((option) => (
                <label
                  key={option.value}
                  className={`option-card ${paymentMethod === option.value ? "option-card-active" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="sr-only"
                    checked={paymentMethod === option.value}
                    onChange={() => setPaymentMethod(option.value)}
                  />
                  <span className="font-semibold">{option.title}</span>
                  <span className="text-brand-ink-soft">{option.text}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl text-brand-ink">Notas</h2>
            <textarea
              name="notes"
              rows={3}
              placeholder="Aclaraciones: color alternativo si se agota la tela, horario de entrega, etc."
              className="input-field resize-none"
            />
          </section>
        </div>

        {/* Resumen */}
        <aside className="h-fit space-y-4 rounded-2xl border border-brand-line bg-white p-5 lg:sticky lg:top-24">
          <h2 className="font-serif text-xl text-brand-ink">Tu pedido</h2>
          <ul className="space-y-2 text-sm">
            {items.map((item) => {
              const { unitPrice, isWholesale } = itemUnitPrice(items, item, isCash);
              return (
                <li key={item.variantId} className="flex justify-between gap-2">
                  <span className="text-brand-ink-soft">
                    {item.quantity}× {item.name}{" "}
                    <span className="text-xs">({item.variantLabel})</span>
                    {isWholesale && (
                      <span className="ml-1 text-xs font-semibold text-brand-sage-dark">mayorista</span>
                    )}
                  </span>
                  <span className="shrink-0 font-medium">{formatPrice(unitPrice * item.quantity)}</span>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-brand-line pt-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-brand-ink">Total</span>
              <span className="text-xl font-bold text-brand-ink">{formatPrice(total)}</span>
            </div>
            <p className="mt-1 text-xs text-brand-ink-soft">
              + envío a coordinar por WhatsApp según destino
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting
              ? "Procesando..."
              : paymentMethod === "MERCADOPAGO"
                ? "Pagar con Mercado Pago"
                : "Confirmar pedido"}
          </button>
        </aside>
      </form>
    </div>
  );
}
