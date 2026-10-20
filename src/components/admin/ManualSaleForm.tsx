"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { computeUnitPrice } from "@/lib/pricing";
import { CHANNEL_LABELS } from "@/lib/order-types";

type Variant = { id: string; name: string; stock: number; priceDelta: number; active: boolean };
type Product = {
  id: string;
  name: string;
  price: number;
  cashPrice: number | null;
  wholesalePrice: number | null;
  wholesaleMinQty: number | null;
  variants: Variant[];
};
type Customer = { id: string; name: string; phone: string | null; isWholesale: boolean };

type Line = {
  key: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: string; // vacio = precio automatico
};

const CHANNELS = ["LOCAL_MAYORISTA", "INSTAGRAM", "CONOCIDO", "FERIA", "OTRO"] as const;
type Channel = (typeof CHANNELS)[number];

let counter = 0;
const nextKey = () => `l${++counter}`;

export function ManualSaleForm({ products, customers }: { products: Product[]; customers: Customer[] }) {
  const router = useRouter();
  const [channel, setChannel] = useState<Channel>("LOCAL_MAYORISTA");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"EFECTIVO" | "TRANSFERENCIA" | "MERCADOPAGO">("EFECTIVO");
  const [paid, setPaid] = useState(true);
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([{ key: nextKey(), productId: "", variantId: "", quantity: 1, unitPrice: "" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const isCash = paymentMethod !== "MERCADOPAGO";

  const qtyByProduct = new Map<string, number>();
  for (const l of lines) {
    if (l.productId) qtyByProduct.set(l.productId, (qtyByProduct.get(l.productId) ?? 0) + l.quantity);
  }

  function autoPrice(line: Line) {
    const product = productById.get(line.productId);
    const variant = product?.variants.find((v) => v.id === line.variantId);
    if (!product || !variant) return null;
    return computeUnitPrice(product, variant.priceDelta, qtyByProduct.get(product.id) ?? line.quantity, isCash);
  }

  function effectivePrice(line: Line) {
    if (line.unitPrice !== "") return Number(line.unitPrice) || 0;
    return autoPrice(line)?.unitPrice ?? 0;
  }

  const total = lines.reduce((sum, l) => sum + effectivePrice(l) * l.quantity, 0);

  function updateLine(key: string, patch: Partial<Line>) {
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const validLines = lines.filter((l) => l.productId && l.variantId && l.quantity > 0);
    if (validLines.length === 0) {
      setError("Agregá al menos un producto con su tela");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          customerId: customerId || null,
          customerName: customerName || undefined,
          phone: phone || undefined,
          paymentMethod,
          paid,
          notes: notes || undefined,
          items: validLines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            quantity: l.quantity,
            unitPrice: l.unitPrice !== "" ? Number(l.unitPrice) : undefined,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo registrar la venta");
        setSaving(false);
        return;
      }
      router.push("/admin/ventas");
      router.refresh();
    } catch {
      setError("Error de conexión");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="space-y-3 rounded-2xl border border-brand-line bg-white p-5">
          <h2 className="font-serif text-lg text-brand-ink">¿Por dónde fue la venta?</h2>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setChannel(c)}
                className={`rounded-full border px-4 py-2 text-sm font-medium ${
                  channel === c ? "border-brand-terracotta bg-brand-terracotta text-white" : "border-brand-line bg-white"
                }`}
              >
                {CHANNEL_LABELS[c]}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-brand-line bg-white p-5">
          <h2 className="font-serif text-lg text-brand-ink">Cliente</h2>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="input-field"
          >
            <option value="">Sin cliente guardado / consumidor final</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.isWholesale ? " (mayorista)" : ""}
              </option>
            ))}
          </select>
          {!customerId && (
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nombre (opcional)"
                className="input-field"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="WhatsApp (opcional)"
                className="input-field"
              />
            </div>
          )}
          <p className="text-xs text-brand-ink-soft">
            Los clientes se guardan en la sección Clientes para tener su historial y lo que deben.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-brand-line bg-white p-5">
          <h2 className="font-serif text-lg text-brand-ink">Productos</h2>
          {lines.map((line) => {
            const product = productById.get(line.productId);
            const variants = product?.variants.filter((v) => v.active) ?? [];
            const auto = autoPrice(line);
            return (
              <div key={line.key} className="space-y-2 rounded-xl border border-brand-line p-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <select
                    value={line.productId}
                    onChange={(e) => updateLine(line.key, { productId: e.target.value, variantId: "", unitPrice: "" })}
                    className="input-field"
                  >
                    <option value="">Producto...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={line.variantId}
                    onChange={(e) => updateLine(line.key, { variantId: e.target.value })}
                    disabled={!product}
                    className="input-field"
                  >
                    <option value="">Tela...</option>
                    {variants.map((v) => (
                      <option key={v.id} value={v.id} disabled={v.stock === 0}>
                        {v.name} · stock {v.stock}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <label className="flex items-center gap-1.5">
                    <span className="text-brand-ink-soft">Cant.</span>
                    <input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(e) => updateLine(line.key, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                      className="input-field w-20"
                    />
                  </label>
                  <label className="flex items-center gap-1.5">
                    <span className="text-brand-ink-soft">Precio c/u</span>
                    <input
                      type="number"
                      min={0}
                      value={line.unitPrice}
                      placeholder={auto ? String(auto.unitPrice) : "auto"}
                      onChange={(e) => updateLine(line.key, { unitPrice: e.target.value })}
                      className="input-field w-28"
                    />
                  </label>
                  {auto && line.unitPrice === "" && (
                    <span className="text-xs text-brand-ink-soft">
                      automático{auto.isWholesale ? " (mayorista)" : isCash ? " (efectivo)" : ""}
                    </span>
                  )}
                  <span className="ml-auto font-semibold text-brand-ink">
                    {formatPrice(effectivePrice(line) * line.quantity)}
                  </span>
                  {lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setLines((ls) => ls.filter((l) => l.key !== line.key))}
                      className="text-xs text-red-600 underline"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => setLines((ls) => [...ls, { key: nextKey(), productId: "", variantId: "", quantity: 1, unitPrice: "" }])}
            className="btn-secondary"
          >
            + Agregar producto
          </button>
        </section>

        <section className="space-y-3 rounded-2xl border border-brand-line bg-white p-5">
          <h2 className="font-serif text-lg text-brand-ink">Notas</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Ej: entregar el viernes, pidió reposición de la tela floral"
            className="input-field resize-none"
          />
        </section>
      </div>

      <aside className="h-fit space-y-4 rounded-2xl border border-brand-line bg-white p-5 lg:sticky lg:top-6">
        <h2 className="font-serif text-lg text-brand-ink">Cobro</h2>
        <div className="flex flex-col gap-2">
          {(["EFECTIVO", "TRANSFERENCIA", "MERCADOPAGO"] as const).map((pm) => (
            <label key={pm} className={`option-card ${paymentMethod === pm ? "option-card-active" : ""}`}>
              <input
                type="radio"
                className="sr-only"
                checked={paymentMethod === pm}
                onChange={() => setPaymentMethod(pm)}
              />
              <span className="font-semibold">
                {pm === "EFECTIVO" ? "Efectivo" : pm === "TRANSFERENCIA" ? "Transferencia" : "Mercado Pago / tarjeta"}
              </span>
            </label>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
          Ya está cobrada
        </label>
        {!paid && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Queda como <strong>a cobrar</strong>. Cuando pague, la marcás cobrada desde Ventas.
          </p>
        )}
        <div className="border-t border-brand-line pt-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-brand-ink">Total</span>
            <span className="text-xl font-bold text-brand-ink">{formatPrice(total)}</span>
          </div>
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? "Guardando..." : "Registrar venta"}
        </button>
        <p className="text-xs text-brand-ink-soft">El stock de las telas se descuenta automáticamente.</p>
      </aside>
    </form>
  );
}
