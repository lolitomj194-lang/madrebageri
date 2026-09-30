import Link from "next/link";
import { Logo } from "@/components/Logo";
import { site, instagramLink, whatsappLink } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-brand-line bg-brand-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-brand-ink-soft">
            Hecho a mano con telas que van cambiando. Cada pieza es única.
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-semibold text-brand-ink">Tienda</p>
          <Link href="/catalogo" className="block text-brand-ink-soft hover:text-brand-terracotta">
            Catálogo
          </Link>
          <Link href="/mayorista" className="block text-brand-ink-soft hover:text-brand-terracotta">
            Venta mayorista
          </Link>
          <Link href="/contacto" className="block text-brand-ink-soft hover:text-brand-terracotta">
            Contacto y envíos
          </Link>
        </div>

        <div className="space-y-2 text-sm">
          <p className="font-semibold text-brand-ink">Seguinos</p>
          <a
            href={instagramLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-brand-ink-soft hover:text-brand-terracotta"
          >
            Instagram @{site.instagram}
          </a>
          <a
            href={whatsappLink(`Hola ${site.name}! Quería hacer una consulta.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-brand-ink-soft hover:text-brand-terracotta"
          >
            WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-brand-line/70 py-4 text-center text-xs text-brand-ink-soft">
        © {new Date().getFullYear()} {site.name} · Envíos a todo el país ·{" "}
        <Link href="/admin/login" className="opacity-40 hover:opacity-100">
          Administración
        </Link>
      </div>
    </footer>
  );
}
