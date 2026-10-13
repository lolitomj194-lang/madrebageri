"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/combos", label: "Combos" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/zonas", label: "Zonas y envíos" },
  { href: "/admin/horarios", label: "Horarios" },
  { href: "/admin/cupones", label: "Cupones" },
  { href: "/admin/configuracion", label: "Configuración" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="scroll-x flex gap-1 lg:flex-col" aria-label="Administración">
      {LINKS.map((l) => {
        const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active ? "bg-brand-ember text-brand-cream" : "text-brand-smoke hover:bg-brand-cream-dark"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
