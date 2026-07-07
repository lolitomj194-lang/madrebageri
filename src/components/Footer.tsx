import Link from "next/link";

const INSTAGRAM = process.env.NEXT_PUBLIC_INSTAGRAM ?? "visionequis";
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5493435173734";

export function Footer() {
  return (
    <footer className="bg-brand-ink text-brand-cream/80 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 grid gap-10 sm:grid-cols-3">
        <div>
          <span className="font-serif text-xl text-brand-cream">
            VISION <span className="text-brand-gold">EQUIS</span>
          </span>
          <p className="mt-3 text-sm leading-relaxed">
            Distribuidor autorizado Ray-Ban en Parana, Entre Rios. Anteojos de sol
            originales, incluyendo la coleccion Scuderia Ferrari.
          </p>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-brand-gold-light mb-3">
            Contacto
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-gold transition-colors"
              >
                WhatsApp: +54 9 343 517-3734
              </a>
            </li>
            <li>
              <a
                href={`https://instagram.com/${INSTAGRAM}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-gold transition-colors"
              >
                Instagram: @{INSTAGRAM}
              </a>
            </li>
            <li>Zona Hipodromo, Parana, Entre Rios</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-brand-gold-light mb-3">
            Tienda
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/catalogo" className="hover:text-brand-gold transition-colors">
                Catalogo completo
              </Link>
            </li>
            <li>
              <Link href="/catalogo?coleccion=Ferrari" className="hover:text-brand-gold transition-colors">
                Coleccion Ferrari
              </Link>
            </li>
            <li>
              <Link href="/ubicacion" className="hover:text-brand-gold transition-colors">
                Retiro en local
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10 py-4 text-center text-xs text-brand-cream/50">
        © {new Date().getFullYear()} Vision Equis · Distribuidor autorizado Ray-Ban · Parana, Argentina
        <Link
          href="/admin/login"
          aria-label="Panel de administracion"
          className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-2 text-sm text-brand-cream/15 hover:text-brand-cream/50 transition-colors"
        >
          ⚙
        </Link>
      </div>
    </footer>
  );
}
