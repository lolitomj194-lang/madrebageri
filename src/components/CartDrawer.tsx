"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore, cartTotal } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const total = cartTotal(items);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            key="drawer"
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between border-b border-brand-line px-6 py-4">
              <h2 className="font-serif text-lg text-brand-ink">Tu carrito</h2>
              <button onClick={closeCart} aria-label="Cerrar carrito" className="h-8 w-8 text-brand-ink/60 hover:text-brand-ink">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <p className="text-sm text-brand-ink/60 mt-8 text-center">
                  Todavia no agregaste productos.
                </p>
              ) : (
                <ul className="space-y-5">
                  {items.map((item) => (
                    <li key={item.variantId} className="flex gap-4">
                      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-md bg-brand-cream">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/producto/${item.slug}`} onClick={closeCart} className="text-sm font-medium text-brand-ink hover:text-brand-gold line-clamp-1">
                          {item.name}
                        </Link>
                        <p className="text-xs text-brand-ink/60">{item.variantLabel}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <select
                            value={item.quantity}
                            onChange={(e) => setQuantity(item.variantId, Number(e.target.value))}
                            className="rounded border border-brand-line px-2 py-1 text-xs"
                          >
                            {Array.from({ length: Math.max(item.maxStock, 1) }, (_, i) => i + 1).map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="text-xs text-brand-ferrari hover:underline"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-brand-ink">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-brand-line px-6 py-5 space-y-4">
                <div className="flex items-center justify-between text-base font-semibold text-brand-ink">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full rounded-full bg-brand-ink py-3 text-center text-sm uppercase tracking-wide text-brand-cream hover:bg-brand-gold hover:text-brand-ink transition-colors"
                >
                  Finalizar compra
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
