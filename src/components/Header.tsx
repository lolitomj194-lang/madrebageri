"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { useCartStore, cartCount } from "@/lib/cart-store";
import { useHydrated } from "@/lib/use-hydrated";

const NAV = [
  { href: "/catalogo", label: "Armá tu asado" },
  { href: "/combos", label: "Combos" },
  { href: "/calculadora", label: "Calculadora" },
  { href: "/presupuesto", label: "Por presupuesto" },
  { href: "/fuego", label: "Todo para el fuego" },
];

export function Header({ openNow }: { openNow: boolean }) {
  const pathname = usePathname();
  // El menu movil se guarda junto con la ruta en la que se abrio: al navegar queda cerrado solo.
  const [menuOpenAt, setMenuOpenAt] = useState<string | null>(null);
  const menuOpen = menuOpenAt === pathname;
  const setMenuOpen = (open: boolean) => setMenuOpenAt(open ? pathname : null);
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.openCart);
  const count = hydrated ? cartCount(items) : 0;

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-brand-carbon/95 text-brand-cream backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo tone="dark" compact />

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[13px] font-medium uppercase tracking-[0.14em] transition-colors hover:text-brand-ember-light ${
                  active ? "text-brand-ember-light" : "text-brand-cream/85"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <span
            className={`hidden items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider sm:inline-flex ${
              openNow ? "bg-brand-success/20 text-emerald-300" : "bg-white/10 text-brand-cream/60"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${openNow ? "bg-emerald-400" : "bg-brand-cream/40"}`} />
            {openNow ? "Abierto ahora" : "Cerrado ahora"}
          </span>

          <button
            type="button"
            onClick={openCart}
            className="relative flex h-11 items-center gap-2 rounded-full bg-brand-ember px-4 text-sm font-semibold text-brand-cream transition-colors hover:bg-brand-ember-light"
            aria-label={`Abrir carrito, ${count} items`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6h15l-1.5 8.5a2 2 0 0 1-2 1.5H8.5a2 2 0 0 1-2-1.6L5 4H2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20" r="1.3" />
              <circle cx="17" cy="20" r="1.3" />
            </svg>
            <span className="hidden sm:inline">Mi asado</span>
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-cream px-1.5 text-xs font-bold text-brand-carbon">
                {count}
              </span>
            )}
          </button>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Abrir menú"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-white/10 bg-brand-carbon lg:hidden" aria-label="Menú móvil">
          <ul className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block border-b border-white/5 py-3.5 font-display text-lg uppercase tracking-wider text-brand-cream"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="py-3 text-xs uppercase tracking-wider text-brand-cream/50">
              {openNow ? "Abierto ahora" : "Cerrado ahora · Miércoles a domingos"}
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
