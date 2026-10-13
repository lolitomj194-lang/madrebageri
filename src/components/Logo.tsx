import Link from "next/link";

/**
 * Logotipo original de ENTRE CORTES: isotipo (brasa sobre parrilla) + marca.
 * `tone="dark"` para fondos oscuros, `tone="light"` para fondos claros.
 */
export function LogoMark({ className = "h-10 w-10", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const ring = tone === "dark" ? "#F8F5EF" : "#171717";
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="none" stroke={ring} strokeWidth="2.5" />
      <circle cx="32" cy="32" r="25" fill="none" stroke={ring} strokeWidth="1" opacity="0.4" />
      {/* parrilla */}
      <g stroke={ring} strokeWidth="2.2" strokeLinecap="round" opacity="0.9">
        <path d="M16 42h32" />
        <path d="M19 47h26" />
        <path d="M23 52h18" />
      </g>
      {/* brasa */}
      <path
        d="M32 12c3.5 6 9 9 9 17 0 5.5-4 9.5-9 9.5s-9-4-9-9.5c0-4 2-6.5 4.5-9.5 0 3 1 5 3 6.5-1-5 0-9 1.5-14z"
        fill="#B83227"
      />
      <path
        d="M32 24c1.8 3 4 4.5 4 8 0 2.6-1.8 4.5-4 4.5s-4-1.9-4-4.5c0-2 1-3.2 2-4.6 0 1.6.5 2.6 1.3 3.2-.4-2.4 0-4.4.7-6.6z"
        fill="#F2A65A"
      />
    </svg>
  );
}

export function Logo({ tone = "dark", compact = false }: { tone?: "dark" | "light"; compact?: boolean }) {
  const main = tone === "dark" ? "text-brand-cream" : "text-brand-carbon";
  const sub = tone === "dark" ? "text-brand-cream/60" : "text-brand-ash";
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="ENTRE CORTES - Inicio">
      <LogoMark tone={tone} className={compact ? "h-9 w-9" : "h-11 w-11"} />
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[11px] font-medium tracking-[0.42em] ${sub}`}>ENTRE</span>
        <span className={`font-display text-2xl font-bold tracking-[0.14em] ${main} transition-colors group-hover:text-brand-ember`}>
          CORTES
        </span>
      </span>
    </Link>
  );
}
