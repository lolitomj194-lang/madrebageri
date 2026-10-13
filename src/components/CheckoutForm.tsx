"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, cartSubtotal, cartDiscount, cartHasEstimates } from "@/lib/cart-store";
import { formatPrice, formatIsoDate } from "@/lib/format";
import { pluralUnit } from "@/lib/pricing";
import type { DeliveryOptions } from "@/lib/delivery";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import { useHydrated } from "@/lib/use-hydrated";

type Method = "EXPRESS" | "PROGRAMADO" | "RETIRO";

function newRequestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function CheckoutForm({ estimateNotice, businessName }: { estimateNotice: string; businessName: string }) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);
  const clear = useCartStore((s) => s.clear);
  const hydrated = useHydrated();
  const [options, setOptions] = useState<DeliveryOptions | null>(null);
  const [requestId] = useState(newRequestId);

  const [method, setMethod] = useState<Method | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    neighborhood: "",
    reference: "",
    mapsLink: "",
    zoneId: "",
    requestedDate: "",
    timeSlot: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/delivery/options")
      .then((r) => r.json())
      .then((data: DeliveryOptions) => {
        setOptions(data);
        setMethod((m) => m ?? (data.express ? "EXPRESS" : data.scheduled ? "PROGRAMADO" : data.pickup ? "RETIRO" : null));
      })
      .catch(() => setServerError("No pudimos cargar las opciones de entrega. Recargá la página."));
  }, []);

  const subtotal = cartSubtotal(items);
  const discount = cartDiscount(items, coupon);
  const goods = subtotal - discount;
  const zone = options?.zones.find((z) => z.id === form.zoneId) ?? null;
  const needsAddress = method === "EXPRESS" || method === "PROGRAMADO";
  const deliveryFee = useMemo(() => {
    if (!needsAddress || !zone) return 0;
    if (zone.freeShippingFrom !== null && goods >= zone.freeShippingFrom) return 0;
    return zone.fee;
  }, [needsAddress, zone, goods]);
  const total = goods + deliveryFee;
  const belowMin = needsAddress && zone ? goods < zone.minOrder : false;
  const dateOption = options?.dates.find((d) => d.date === form.requestedDate) ?? null;

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      const next = { ...e };
      delete next[key];
      return next;
    });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (form.customerName.trim().length < 3) e.customerName = "Ingresá tu nombre y apellido.";
    if (form.phone.replace(/\D/g, "").length < 10) e.phone = "Ingresá tu WhatsApp con código de área (ej: 343 5123456).";
    if (!method) e.method = "Elegí una modalidad de entrega.";
    if (needsAddress) {
      if (!form.address.trim()) e.address = "Ingresá calle y número.";
      if (!form.zoneId) e.zoneId = "Elegí tu zona de reparto.";
    }
    if (method === "PROGRAMADO" || method === "RETIRO") {
      if (!form.requestedDate) e.requestedDate = "Elegí el día.";
      if (!form.timeSlot) e.timeSlot = "Elegí una franja horaria.";
    }
    if (belowMin && zone) e.zoneId = `La compra mínima para ${zone.name} es ${formatPrice(zone.minOrder)}.`;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setServerError(null);
    if (!validate()) {
      document.querySelector("[aria-invalid='true']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientRequestId: requestId,
          ...form,
          deliveryMethod: method,
          couponCode: coupon?.code,
          items: items.map((i) => ({ kind: i.kind, id: i.id, quantity: i.quantity, persons: i.persons })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "No se pudo registrar el pedido.");
        return;
      }
      clear();
      if (data.whatsappUrl) {
        // Intento de apertura inmediata (si el navegador la bloquea, la pantalla final tiene el boton).
        window.open(data.whatsappUrl, "_blank", "noopener");
      }
      router.push(data.redirectUrl);
    } catch {
      setServerError("Error de conexión. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated) return <div className="mt-10 h-40 animate-pulse rounded-2xl bg-brand-cream-dark" />;

  if (items.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-brand-line bg-white p-10 text-center">
        <p className="font-display text-2xl uppercase">Tu asado está vacío</p>
        <p className="mt-2 text-sm text-brand-ash">Agregá cortes, combos o accesorios antes de finalizar.</p>
        <Link href="/catalogo" className="btn btn-primary mt-6">Armá tu asado</Link>
      </div>
    );
  }

  const methodCards: { value: Method; title: string; text: string; available: boolean; note?: string }[] = [
    {
      value: "EXPRESS",
      title: "Delivery express",
      text: `Lo antes posible. Objetivo aproximado: ${options?.expressTargetMinutes ?? 60} min, sujeto a confirmación.`,
      available: Boolean(options?.express),
      note: options && options.expressEnabled && !options.openNow ? "Solo dentro del horario de atención" : undefined,
    },
    { value: "PROGRAMADO", title: "Delivery programado", text: "Elegí día y franja horaria.", available: Boolean(options?.scheduled) },
    { value: "RETIRO", title: "Retiro por local", text: options?.address ? `Sin costo de envío. ${options.address}` : "Sin costo de envío.", available: Boolean(options?.pickup) },
  ];

  return (
    <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]" noValidate>
      <div className="space-y-8">
        {/* Modalidad */}
        <section className="rounded-2xl border border-brand-line bg-white p-6">
          <h2 className="font-display text-2xl uppercase text-brand-carbon">1. ¿Cómo lo recibís?</h2>
          {!options && <p className="mt-3 text-sm text-brand-ash">Cargando opciones…</p>}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {methodCards.map((m) => (
              <label key={m.value} className={`option-card ${method === m.value ? "option-card-active" : ""} ${!m.available ? "opacity-50" : ""}`}>
                <input
                  type="radio"
                  name="method"
                  className="sr-only"
                  checked={method === m.value}
                  disabled={!m.available}
                  onChange={() => {
                    setMethod(m.value);
                    setErrors((e) => ({ ...e, method: "" }));
                  }}
                />
                <span className="font-semibold">{m.title}</span>
                <span className="text-xs text-brand-ash">{m.text}</span>
                {!m.available && <span className="text-xs text-brand-ember">{m.note ?? "No disponible"}</span>}
              </label>
            ))}
          </div>
          {errors.method && <p className="mt-2 text-xs text-brand-ember">{errors.method}</p>}
          {method === "EXPRESS" && (
            <p className="mt-3 rounded-xl bg-brand-cream px-4 py-3 text-xs text-brand-smoke">
              La entrega express tiene un objetivo aproximado de {options?.expressTargetMinutes ?? 60} minutos y queda sujeta a confirmación por WhatsApp. No es una entrega garantizada.
            </p>
          )}
        </section>

        {/* Datos */}
        <section className="rounded-2xl border border-brand-line bg-white p-6">
          <h2 className="font-display text-2xl uppercase text-brand-carbon">2. Tus datos</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="customerName">Nombre y apellido *</label>
              <input id="customerName" className="input-field" value={form.customerName} onChange={(e) => set("customerName", e.target.value)} aria-invalid={Boolean(errors.customerName)} autoComplete="name" />
              {errors.customerName && <p className="mt-1 text-xs text-brand-ember">{errors.customerName}</p>}
            </div>
            <div>
              <label className="label" htmlFor="phone">WhatsApp *</label>
              <input id="phone" className="input-field" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="343 5123456" inputMode="tel" autoComplete="tel" aria-invalid={Boolean(errors.phone)} />
              {errors.phone ? <p className="mt-1 text-xs text-brand-ember">{errors.phone}</p> : <p className="mt-1 text-xs text-brand-ash">Con código de área, sin 0 ni 15.</p>}
            </div>
          </div>

          {needsAddress && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="zoneId">Zona de reparto *</label>
                <select id="zoneId" className="input-field" value={form.zoneId} onChange={(e) => set("zoneId", e.target.value)} aria-invalid={Boolean(errors.zoneId)}>
                  <option value="">Elegí tu zona…</option>
                  {options?.zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} · {z.fee === 0 ? "sin cargo" : `envío ${formatPrice(z.fee)}`}
                      {z.freeShippingFrom ? ` · gratis desde ${formatPrice(z.freeShippingFrom)}` : ""}
                    </option>
                  ))}
                </select>
                {zone?.neighborhoods && <p className="mt-1 text-xs text-brand-ash">Barrios: {zone.neighborhoods}</p>}
                {errors.zoneId && <p className="mt-1 text-xs text-brand-ember">{errors.zoneId}</p>}
                {options && options.zones.length === 0 && <p className="mt-1 text-xs text-brand-ember">No hay zonas de reparto habilitadas. Elegí retiro por local.</p>}
              </div>
              <div>
                <label className="label" htmlFor="address">Calle y número *</label>
                <input id="address" className="input-field" value={form.address} onChange={(e) => set("address", e.target.value)} autoComplete="street-address" aria-invalid={Boolean(errors.address)} />
                {errors.address && <p className="mt-1 text-xs text-brand-ember">{errors.address}</p>}
              </div>
              <div>
                <label className="label" htmlFor="neighborhood">Barrio</label>
                <input id="neighborhood" className="input-field" value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="reference">Referencias (piso, dpto, entre calles)</label>
                <input id="reference" className="input-field" value={form.reference} onChange={(e) => set("reference", e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="mapsLink">Enlace de Google Maps (opcional)</label>
                <input id="mapsLink" className="input-field" value={form.mapsLink} onChange={(e) => set("mapsLink", e.target.value)} placeholder="https://maps.app.goo.gl/…" inputMode="url" />
              </div>
            </div>
          )}

          {(method === "PROGRAMADO" || method === "RETIRO") && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="requestedDate">{method === "RETIRO" ? "Día de retiro *" : "Día de entrega *"}</label>
                <select id="requestedDate" className="input-field" value={form.requestedDate} onChange={(e) => { set("requestedDate", e.target.value); set("timeSlot", ""); }} aria-invalid={Boolean(errors.requestedDate)}>
                  <option value="">Elegí el día…</option>
                  {options?.dates.map((d) => (
                    <option key={d.date} value={d.date}>{formatIsoDate(d.date)}</option>
                  ))}
                </select>
                {errors.requestedDate && <p className="mt-1 text-xs text-brand-ember">{errors.requestedDate}</p>}
                {options && options.dates.length === 0 && <p className="mt-1 text-xs text-brand-ember">No hay días disponibles en los próximos días.</p>}
              </div>
              <div>
                <label className="label" htmlFor="timeSlot">Franja horaria *</label>
                <select id="timeSlot" className="input-field" value={form.timeSlot} onChange={(e) => set("timeSlot", e.target.value)} disabled={!dateOption} aria-invalid={Boolean(errors.timeSlot)}>
                  <option value="">Elegí la franja…</option>
                  {dateOption?.slots.map((s) => (
                    <option key={s.slot} value={s.slot} disabled={method === "PROGRAMADO" && s.full}>
                      {s.slot} hs{method === "PROGRAMADO" && s.full ? " · sin cupo" : ""}
                    </option>
                  ))}
                </select>
                {errors.timeSlot && <p className="mt-1 text-xs text-brand-ember">{errors.timeSlot}</p>}
              </div>
            </div>
          )}

          <div className="mt-6">
            <label className="label" htmlFor="notes">Observaciones</label>
            <textarea id="notes" className="input-field min-h-[90px]" value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Ej: cortes más finos, sin morcilla, tocar timbre…" />
          </div>
        </section>
      </div>

      {/* Resumen */}
      <aside className="h-fit rounded-2xl border border-brand-line bg-white p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-2xl uppercase text-brand-carbon">3. Tu pedido</h2>
        <ul className="mt-4 divide-y divide-brand-line text-sm">
          {items.map((i) => (
            <li key={i.key} className="flex justify-between gap-3 py-2">
              <span>
                <span className="font-medium">{i.quantity} {pluralUnit(i.unitLabel, i.quantity)}</span> de {i.name}
                {i.estimated && <span className="text-brand-ash"> (estimado)</span>}
              </span>
              <span className="whitespace-nowrap">{formatPrice(i.unitPrice * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t border-brand-line pt-3 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
          {discount > 0 && <div className="flex justify-between text-brand-success"><dt>Cupón {coupon?.code}</dt><dd>- {formatPrice(discount)}</dd></div>}
          <div className="flex justify-between">
            <dt>Envío</dt>
            <dd>{method === "RETIRO" ? "Sin cargo" : zone ? (deliveryFee === 0 ? "Gratis" : formatPrice(deliveryFee)) : "Según zona"}</dd>
          </div>
          <div className="flex justify-between border-t border-brand-line pt-2 font-display text-2xl">
            <dt>Total {cartHasEstimates(items) ? "estimado" : ""}</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>
        {cartHasEstimates(items) && <p className="mt-3 text-[11px] leading-snug text-brand-ash">{estimateNotice}</p>}
        <p className="mt-3 text-[11px] leading-snug text-brand-ash">
          Al enviar, registramos tu solicitud y abrimos WhatsApp con el detalle. {businessName} confirma disponibilidad, importe final y forma de pago por chat. No se realiza ningún pago en la web.
        </p>
        {options && !options.whatsappConfigured && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            El número de WhatsApp comercial todavía no está configurado. Tu solicitud se registrará igual y te contactaremos.
          </p>
        )}
        {serverError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-brand-ember">{serverError}</p>}
        <button type="submit" disabled={submitting || !options} className="btn btn-whatsapp mt-5 w-full">
          <WhatsAppIcon className="h-5 w-5 fill-white" />
          {submitting ? "Registrando…" : "Enviar mi pedido por WhatsApp"}
        </button>
        <Link href="/catalogo" className="mt-3 block text-center text-xs text-brand-ash underline">Seguir agregando productos</Link>
      </aside>
    </form>
  );
}
