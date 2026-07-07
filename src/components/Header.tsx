"use client";

import Link from "next/link";
import { useState } from "react";
import { useCartStore, cartCount } from "@/lib/cart-store";

const NAV_LINKS = [
  { href: "/catalogo", label: "Catalogo" },
  { href: "/catalogo?coleccion=Ferrari", label: "Coleccion Ferrari" },
  { href: "/ubicacion", label: "Ubicacion" },
  { href: "/contacto", label: "Contacto" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const count = cartCount(items);

  return (
    <header className="sticky top-0 z-30 bg-brand-ink text-brand-cream border-b border-white/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex flex-col leading-none group">
          <span className="font-serif text-2xl tracking-[0.15em] text-brand-cream group-hover:text-brand-gold transition-colors">
            VISION <span className="text-brand-gold">EQUIS</span>
          </span>
          <span className="text-[10px] tracking-[0.35em] uppercase mt-1 text-brand-gold-light/70">
            Ray-Ban Official Dealer &middot; Parana
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm tracking-wide uppercase">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-brand-gold transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={openCart}
            aria-label="Ver carrito"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/15 hover:border-brand-gold transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current fill-none" strokeWidth={1.6}>
              <path d="M6 6h15l-1.5 9h-12z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 6L5 3H2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-ferrari px-1 text-[11px] font-semibold text-white">
                {count}
              </span>
            )}
          </button>

          <button
            className="md:hidden flex h-10 w-10 items-center justify-center"
            aria-label="Menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 stroke-current fill-none" strokeWidth={1.6}>
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-white/10 bg-brand-ink px-4 py-4 flex flex-col gap-4 text-sm uppercase tracking-wide">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="hover:text-brand-gold transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
