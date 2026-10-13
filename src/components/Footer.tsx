import Link from "next/link";
import { Logo } from "@/components/Logo";
import { whatsappLink, formatArPhone } from "@/lib/whatsapp";
import type { BusinessSettings } from "@/lib/settings";

type HoursRow = { name: string; text: string; open: boolean };

export function Footer({ settings, hours }: { settings: BusinessSettings; hours: HoursRow[] }) {
  return (
    <footer className="bg-brand-carbon text-brand-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-1">
          <Logo tone="dark" />
          <p className="mt-4 text-sm text-brand-cream/65">{settings.slogan2}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-brand-cream/40">{settings.city}</p>
        </div>

        <div>
          <h3 className="font-display text-sm uppercase tracking-[0.25em] text-brand-ember-light">Comprar</h3>
          <ul className="mt-4 space-y-2 text-sm text-brand-cream/80">
            <li><Link href="/catalogo" className="hover:text-brand-cream">Armá tu asado</Link></li>
            <li><Link href="/combos" className="hover:text-brand-cream">Combos prearmados</Link></li>
            <li><Link href="/calculadora" className="hover:text-brand-cream">Calculadora de asado</Link></li>
            <li><Link href="/presupuesto" className="hover:text-brand-cream">Asado según tu presupuesto</Link></li>
            <li><Link href="/fuego" className="hover:text-brand-cream">Todo para el fuego</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm uppercase tracking-[0.25em] text-brand-ember-light">Horarios</h3>
          <ul className="mt-4 space-y-1.5 text-sm">
            {hours.map((h) => (
              <li key={h.name} className="flex justify-between gap-4">
                <span className={h.open ? "text-brand-cream/80" : "text-brand-cream/35"}>{h.name}</span>
                <span className={h.open ? "text-brand-cream" : "text-brand-cream/35"}>{h.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm uppercase tracking-[0.25em] text-brand-ember-light">Contacto</h3>
          <ul className="mt-4 space-y-2 text-sm text-brand-cream/80">
            {settings.whatsapp ? (
              <li>
                <a href={whatsappLink(settings.whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:text-brand-cream">
                  WhatsApp {formatArPhone(settings.whatsapp)}
                </a>
              </li>
            ) : (
              <li className="text-brand-cream/50">WhatsApp: a configurar desde el panel</li>
            )}
            {settings.address && <li>{settings.address}</li>}
            <li>{settings.city}</li>
            {settings.instagram && (
              <li>
                <a href={`https://instagram.com/${settings.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-cream">
                  Instagram @{settings.instagram.replace("@", "")}
                </a>
              </li>
            )}
            {settings.facebook && (
              <li>
                <a href={settings.facebook.startsWith("http") ? settings.facebook : `https://facebook.com/${settings.facebook}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-cream">
                  Facebook
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-brand-cream/40 sm:flex-row sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} {settings.name} · {settings.city}</span>
          <span>Los precios de cortes por kilo son estimados y se confirman por WhatsApp. <Link href="/admin/login" className="ml-2 hover:text-brand-cream/70">Admin</Link></span>
        </div>
      </div>
    </footer>
  );
}
