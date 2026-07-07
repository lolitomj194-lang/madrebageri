const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5493435173734";
const INSTAGRAM = process.env.NEXT_PUBLIC_INSTAGRAM ?? "visionequis";

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-brand-ink/50">Contacto</p>
      <h1 className="mt-2 font-serif text-3xl text-brand-ink">Hablemos</h1>
      <p className="mt-4 text-brand-ink/70">
        Consultanos por disponibilidad de modelos, talles o cualquier duda antes de comprar.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <a
          href={`https://wa.me/${WHATSAPP}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-brand-line bg-white p-8 transition-colors hover:border-[#25D366]"
        >
          <p className="font-serif text-lg text-brand-ink">WhatsApp</p>
          <p className="mt-2 text-sm text-brand-ink/60">+54 9 343 517-3734</p>
        </a>
        <a
          href={`https://instagram.com/${INSTAGRAM}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl border border-brand-line bg-white p-8 transition-colors hover:border-brand-gold"
        >
          <p className="font-serif text-lg text-brand-ink">Instagram</p>
          <p className="mt-2 text-sm text-brand-ink/60">@{INSTAGRAM}</p>
        </a>
      </div>
    </div>
  );
}
