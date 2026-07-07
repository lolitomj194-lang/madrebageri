const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5493435173734";

export default function UbicacionPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.3em] text-brand-ink/50">Retiro en local</p>
      <h1 className="mt-2 font-serif text-3xl text-brand-ink">Visitanos en Parana</h1>
      <p className="mt-4 max-w-xl text-brand-ink/70">
        Retira tu pedido en persona, proba los modelos y recibi asesoramiento personalizado.
        Coordinamos el dia y horario de retiro por WhatsApp.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-brand-line">
          <iframe
            title="Ubicacion Vision Equis - Zona Hipodromo, Parana"
            src="https://www.google.com/maps?q=Hipodromo+de+Parana,+Entre+Rios,+Argentina&output=embed"
            className="h-96 w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-brand-ink/50 mb-2">Zona</h2>
            <p className="text-brand-ink">Zona Hipodromo, Parana, Entre Rios</p>
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-brand-ink/50 mb-2">WhatsApp</h2>
            <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="text-brand-ink hover:text-brand-gold">
              +54 9 343 517-3734
            </a>
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] text-brand-ink/50 mb-2">Envios</h2>
            <p className="text-brand-ink/80">Hacemos envios a todo el pais, coordinando el medio de transporte con cada cliente.</p>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hola! Quiero coordinar el retiro de un pedido en el local.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-brand-ink px-8 py-3 text-sm uppercase tracking-wide text-brand-cream hover:bg-brand-gold hover:text-brand-ink transition-colors"
          >
            Coordinar retiro
          </a>
        </div>
      </div>
    </div>
  );
}
