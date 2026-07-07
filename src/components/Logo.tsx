import Link from "next/link";

// TODO: replace with <Image src="/logo.png" .../> once the real Vision Equis
// logo file is provided. Placeholder wordmark keeps the layout working today.
export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex flex-col leading-none group">
      <span
        className={`font-serif text-2xl tracking-[0.15em] transition-colors ${
          dark ? "text-brand-cream" : "text-brand-ink"
        } group-hover:text-brand-gold`}
      >
        VISION <span className="text-brand-gold">EQUIS</span>
      </span>
      <span
        className={`text-[10px] tracking-[0.35em] uppercase mt-1 ${
          dark ? "text-brand-gold-light/70" : "text-brand-ink/60"
        }`}
      >
        Ray-Ban Official Dealer · Parana
      </span>
    </Link>
  );
}
