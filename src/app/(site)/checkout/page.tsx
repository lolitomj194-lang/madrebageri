"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore, cartTotal } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

type ShippingMethod = "ENVIO" | "RETIRO_LOCAL";
type PaymentMethod = "MERCADOPAGO" | "TRANSFERENCIA" | "EFECTIVO";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const total = cartTotal(items);
  const router = useRouter();

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("RETIRO_LOCAL");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MERCADOPAGO");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-serif text-2xl text-brand-ink">Tu carrito esta vacio</h1>
        <p className="mt-3 text-brand-ink/60">Agrega productos desde el catalogo para finalizar una compra.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      customerName: String(form.get("customerName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      shippingMethod,
      address: String(form.get("address") ?? ""),
      city: String(form.get("city") ?? ""),
      province: String(form.get("province") ?? ""),
      paymentMethod,
      notes: String(form.get("notes") ?? ""),
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
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo procesar el pedido");
        setLoading(false);
        return;
      }
      clear();
      if (data.redirectUrl?.startsWith("http")) {
        window.location.href = data.redirectUrl;
      } else {
        router.push(data.redirectUrl);
      }
    } catch {
      setError("Error de conexion. Intenta nuevamente.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl text-brand-ink mb-8">Finalizar compra</h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} className="space-y-8">
          <section>
            <h2 className="text-sm uppercase tracking-[0.2em] text-brand-ink/50 mb-4">Tus datos</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input name="customerName" required placeholder="Nombre y apellido" className="input-field" />
              <input name="phone" required placeholder="Telefono / WhatsApp" className="input-field" />
              <input name="email" type="email" placeholder="Email (opcional)" className="input-field sm:col-span-2" />
            </div>
          </section>

          <section>
            <h2 className="text-sm uppercase tracking-[0.2em] text-brand-ink/50 mb-4">Entrega</h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className={`option-card ${shippingMethod === "RETIRO_LOCAL" ? "option-card-active" : ""}`}>
                <input
                  type="radio"
                  name="shippingMethodRadio"
                  className="hidden"
                  checked={shippingMethod === "RETIRO_LOCAL"}
                  onChange={() => setShippingMethod("RETIRO_LOCAL")}
                />
                <span className="font-medium">Retiro en local</span>
                <span className="text-xs text-brand-ink/60">Zona Hipodromo, Parana</span>
              </label>
              <label className={`option-card ${shippingMethod === "ENVIO" ? "option-card-active" : ""}`}>
                <input
                  type="radio"
                  name="shippingMethodRadio"
                  className="hidden"
                  checked={shippingMethod === "ENVIO"}
                  onChange={() => setShippingMethod("ENVIO")}
                />
                <span className="font-medium">Envio a domicilio</span>
                <span className="text-xs text-brand-ink/60">A todo el pais, coordinamos por WhatsApp</span>
              </label>
            </div>

            {shippingMethod === "ENVIO" && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input name="address" required placeholder="Direccion" className="input-field sm:col-span-2" />
                <input name="city" required placeholder="Ciudad" className="input-field" />
                <input name="province" required placeholder="Provincia" className="input-field" />
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm uppercase tracking-[0.2em] text-brand-ink/50 mb-4">Medio de pago</h2>
            <div className="flex flex-col gap-3">
              {(
                [
                  { id: "MERCADOPAGO", label: "Mercado Pago", desc: "Tarjeta, cuotas o dinero en cuenta" },
                  { id: "TRANSFERENCIA", label: "Transferencia bancaria", desc: "Te enviamos los datos por WhatsApp" },
                  { id: "EFECTIVO", label: "Efectivo", desc: "Al retirar en el local" },
                ] as const
              ).map((opt) => (
                <label key={opt.id} className={`option-card ${paymentMethod === opt.id ? "option-card-active" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethodRadio"
                    className="hidden"
                    checked={paymentMethod === opt.id}
                    onChange={() => setPaymentMethod(opt.id)}
                  />
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-xs text-brand-ink/60">{opt.desc}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <textarea
              name="notes"
              placeholder="Notas adicionales (opcional)"
              className="input-field w-full"
              rows={3}
            />
          </section>

          {error && <p className="text-sm text-brand-ferrari">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand-ink py-4 text-sm uppercase tracking-wide text-brand-cream transition-colors hover:bg-brand-gold hover:text-brand-ink disabled:opacity-50"
          >
            {loading ? "Procesando..." : "Confirmar pedido"}
          </button>
        </form>

        <aside className="h-fit rounded-2xl border border-brand-line bg-white p-6">
          <h2 className="font-serif text-lg text-brand-ink mb-4">Tu pedido</h2>
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.variantId} className="flex gap-3">
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-brand-cream">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium text-brand-ink line-clamp-1">{item.name}</p>
                  <p className="text-xs text-brand-ink/60">
                    {item.variantLabel} · x{item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-brand-ink">{formatPrice(item.unitPrice * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center justify-between border-t border-brand-line pt-4 font-serif text-lg text-brand-ink">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
