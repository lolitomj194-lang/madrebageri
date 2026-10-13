"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  useCartStore,
  cartSubtotal,
  cartDiscount,
  cartHasEstimates,
  cartHasMeat,
  cartHasFire,
  type CartLine,
} from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { formatWeightRange, pluralUnit } from "@/lib/pricing";
import { QuantityStepper } from "@/components/QuantityStepper";
import { productToCartLine } from "@/components/ProductCard";
import type { ClientProduct } from "@/lib/catalog";

function LineRow({ line }: { line: CartLine }) {
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const weight =
    line.portionMinGrams && line.portionMaxGrams
      ? formatWeightRange(line.portionMinGrams * line.quantity, line.portionMaxGrams * line.quantity)
      : null;
  return (
    <li className="flex gap-3 py-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-carbon">
        {line.image && <Image src={line.image} alt={line.name} fill sizes="80px" className="object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-display text-lg uppercase leading-tight text-brand-carbon">{line.name}</p>
            <p className="text-xs text-brand-ash">
              {formatPrice(line.unitPrice)} / {line.unitLabel}
              {line.estimated && " · estimado"}
            </p>
            {line.summary && <p className="mt-1 line-clamp-2 text-[11px] text-brand-ash">{line.summary}</p>}
          </div>
          <button
            type="button"
            onClick={() => removeLine(line.key)}
            className="shrink-0 rounded-full p-1 text-brand-ash hover:bg-brand-cream-dark hover:text-brand-ember"
            aria-label={`Quitar ${line.name}`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <QuantityStepper
            value={line.quantity}
            onChange={(q) => setQuantity(line.key, q)}
            min={line.minQuantity}
            size="sm"
            label={`Cantidad de ${pluralUnit(line.unitLabel, 2)} de ${line.name}`}
          />
          <div className="text-right">
            <p className="font-semibold">{formatPrice(line.unitPrice * line.quantity)}</p>
            <p className="text-[11px] text-brand-ash">
              {line.quantity} {pluralUnit(line.unitLabel, line.quantity)}
              {weight ? ` · ${weight}` : ""}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
}

function FireSuggestions({ items }: { items: CartLine[] }) {
  const [products, setProducts] = useState<ClientProduct[] | null>(null);
  const addLine = useCartStore((s) => s.addLine);
  const show = cartHasMeat(items) && !cartHasFire(items);

  useEffect(() => {
    if (!show || products) return;
    fetch("/api/products?role=FUEGO")
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => setProducts([]));
  }, [show, products]);

  if (!show || !products?.length) return null;
  return (
    <div className="rounded-2xl border border-dashed border-brand-wood/40 bg-brand-cream p-4">
      <p className="font-display text-lg uppercase leading-none text-brand-carbon">¿Ya tenés todo para prender el fuego?</p>
      <p className="mt-1 text-xs text-brand-ash">Sumá leña o carbón al mismo pedido.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {products.slice(0, 3).map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => addLine(productToCartLine(p), p.minQuantity, false)}
            className="chip"
          >
            + {p.name} · {formatPrice(p.unitPrice)}
          </button>
        ))}
      </div>
    </div>
  );
}

function CouponBox({ subtotal }: { subtotal: number }) {
  const coupon = useCartStore((s) => s.coupon);
  const setCoupon = useCartStore((s) => s.setCoupon);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function apply() {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Cupón inválido");
        return;
      }
      setCoupon(data.coupon);
      setCode("");
    } catch {
      setError("No se pudo validar el cupón");
    } finally {
      setLoading(false);
    }
  }

  if (coupon) {
    return (
      <div className="flex items-center justify-between rounded-xl bg-brand-success/10 px-4 py-2.5 text-sm">
        <span>
          Cupón <strong>{coupon.code}</strong> aplicado
          {subtotal < coupon.minTotal && <span className="block text-xs text-brand-ember">Requiere compra mínima de {formatPrice(coupon.minTotal)}</span>}
        </span>
        <button type="button" onClick={() => setCoupon(null)} className="text-xs font-semibold uppercase tracking-wider text-brand-ash hover:text-brand-ember">
          Quitar
        </button>
      </div>
    );
  }
  return (
    <div>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Cupón de descuento"
          className="input-field"
          aria-label="Cupón de descuento"
          onKeyDown={(e) => e.key === "Enter" && apply()}
        />
        <button type="button" onClick={apply} disabled={loading || !code.trim()} className="btn btn-outline btn-sm">
          Aplicar
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-brand-ember">{error}</p>}
    </div>
  );
}

export function CartDrawer({ estimateNotice }: { estimateNotice: string }) {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);
  const subtotal = cartSubtotal(items);
  const discount = cartDiscount(items, coupon);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeCart]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            role="dialog"
            aria-modal="true"
            aria-label="Mi asado"
          >
            <div className="flex items-center justify-between border-b border-brand-line px-5 py-4">
              <h2 className="font-display text-2xl uppercase text-brand-carbon">Mi asado</h2>
              <button type="button" onClick={closeCart} className="rounded-full p-2 hover:bg-brand-cream-dark" aria-label="Cerrar carrito">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <p className="font-display text-2xl uppercase text-brand-carbon">Todavía no armaste tu asado</p>
                  <p className="text-sm text-brand-ash">Elegí cortes por porción, un combo o usá la calculadora.</p>
                  <Link href="/catalogo" onClick={closeCart} className="btn btn-primary">Armá tu asado</Link>
                  <Link href="/calculadora" onClick={closeCart} className="text-sm underline">Calculá tu asado</Link>
                </div>
              ) : (
                <>
                  <ul className="divide-y divide-brand-line">
                    {items.map((line) => (
                      <LineRow key={line.key} line={line} />
                    ))}
                  </ul>
                  <div className="space-y-3 pb-4">
                    <FireSuggestions items={items} />
                    <CouponBox subtotal={subtotal} />
                  </div>
                </>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-brand-line bg-brand-cream px-5 py-4">
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
                  {discount > 0 && (
                    <div className="flex justify-between text-brand-success"><dt>Descuento ({coupon?.code})</dt><dd>- {formatPrice(discount)}</dd></div>
                  )}
                  <div className="flex justify-between text-brand-ash"><dt>Envío</dt><dd>Se calcula según tu zona</dd></div>
                  <div className="flex justify-between border-t border-brand-line pt-2 font-display text-xl">
                    <dt>Total {cartHasEstimates(items) ? "estimado" : ""}</dt>
                    <dd>{formatPrice(subtotal - discount)}</dd>
                  </div>
                </dl>
                {cartHasEstimates(items) && <p className="mt-2 text-[11px] leading-snug text-brand-ash">{estimateNotice}</p>}
                <Link href="/checkout" onClick={closeCart} className="btn btn-primary mt-4 w-full">
                  Finalizar pedido
                </Link>
                <p className="mt-2 text-center text-[11px] text-brand-ash">Sin registro. El pedido se envía por WhatsApp.</p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
