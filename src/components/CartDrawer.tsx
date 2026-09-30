"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCartStore,
  cartTotal,
  itemUnitPrice,
  productQuantity,
} from "@/lib/cart-store";
import { hasWholesale } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, setQuantity } = useCartStore();
  const total = cartTotal(items, false);
  const cashTotal = cartTotal(items, true);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-brand-ink/40 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-brand-line px-5 py-4">
          <h2 className="font-serif text-xl text-brand-ink">Tu carrito</h2>
          <button
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="rounded-full p-2 hover:bg-brand-sand"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-brand-ink-soft">Tu carrito está vacío.</p>
            <Link href="/catalogo" onClick={closeCart} className="btn-primary">
              Ver catálogo
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {items.map((item) => {
                const { unitPrice, isWholesale } = itemUnitPrice(items, item, false);
                const missingForWholesale =
                  !isWholesale && hasWholesale(item.pricing)
                    ? (item.pricing.wholesaleMinQty as number) -
                      productQuantity(items, item.productId)
                    : 0;
                return (
                  <li key={item.variantId} className="flex gap-3 rounded-xl border border-brand-line bg-white p-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-brand-cream">
                      {item.image && (
                        <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <p className="text-sm font-semibold leading-snug text-brand-ink">{item.name}</p>
                      <p className="text-xs text-brand-ink-soft">{item.variantLabel}</p>
                      <p className="mt-0.5 text-sm font-semibold text-brand-ink">
                        {formatPrice(unitPrice)}
                        {isWholesale && (
                          <span className="ml-1.5 rounded-full bg-brand-sage/15 px-2 py-0.5 text-[0.65rem] font-semibold text-brand-sage-dark">
                            precio mayorista
                          </span>
                        )}
                      </p>
                      {missingForWholesale > 0 && (
                        <p className="text-[0.7rem] text-brand-terracotta">
                          Sumando {missingForWholesale} más de este producto pasás a{" "}
                          {formatPrice(item.pricing.wholesalePrice as number)} c/u
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-brand-line">
                          <button
                            onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                            className="px-2.5 py-1 text-brand-ink-soft hover:text-brand-ink"
                            aria-label="Restar uno"
                          >
                            −
                          </button>
                          <span className="min-w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="px-2.5 py-1 text-brand-ink-soft hover:text-brand-ink disabled:opacity-30"
                            aria-label="Sumar uno"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-xs text-brand-ink-soft underline hover:text-brand-terracotta"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="space-y-3 border-t border-brand-line bg-white px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-ink-soft">Total (tarjeta / Mercado Pago)</span>
                <span className="font-semibold text-brand-ink">{formatPrice(total)}</span>
              </div>
              {cashTotal < total && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-ink-soft">Total efectivo / transferencia</span>
                  <span className="font-semibold text-brand-sage-dark">{formatPrice(cashTotal)}</span>
                </div>
              )}
              <p className="text-xs text-brand-ink-soft">
                El costo de envío se coordina por WhatsApp según destino.
              </p>
              <Link href="/checkout" onClick={closeCart} className="btn-primary w-full">
                Finalizar compra
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
