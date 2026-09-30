import { site, instagramLink, whatsappLink } from "@/lib/site";

export const metadata = { title: "Contacto y envíos" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-3xl text-brand-ink sm:text-4xl">Contacto y envíos</h1>

      <div className="mt-8 space-y-6">
        <section className="rounded-2xl border border-brand-line bg-white p-6">
          <h2 className="font-serif text-xl text-brand-terracotta">Hablemos</h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-ink-soft">
            La forma más rápida de consultarnos es por WhatsApp: telas
            disponibles, medidas especiales, pedidos mayoristas o el estado de
            tu compra.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={whatsappLink(`Hola ${site.name}! Quería hacer una consulta.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              WhatsApp
            </a>
            <a
              href={instagramLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Instagram @{site.instagram}
            </a>
          </div>
        </section>

        <section className="rounded-2xl border border-brand-line bg-white p-6">
          <h2 className="font-serif text-xl text-brand-terracotta">Envíos a todo el país</h2>
          <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm leading-relaxed text-brand-ink-soft">
            <li>Despachamos por Correo Argentino o transporte, a domicilio o a sucursal.</li>
            <li>
              El costo del envío depende del destino y del tamaño del paquete
              (no es lo mismo un almohadón que un acolchado), así que lo
              coordinamos por WhatsApp después de tu pedido.
            </li>
            <li>También podés retirar en persona coordinando día y horario.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-brand-line bg-white p-6">
          <h2 className="font-serif text-xl text-brand-terracotta">Medios de pago</h2>
          <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm leading-relaxed text-brand-ink-soft">
            <li>Mercado Pago: tarjeta de crédito, débito y cuotas.</li>
            <li>Transferencia bancaria o efectivo, con descuento sobre el precio de lista.</li>
            <li>Pedidos mayoristas: se activan solos por cantidad, sin registro.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
