import type { Metadata } from "next";
import { getBusinessSettings } from "@/lib/settings";
import { CheckoutForm } from "@/components/CheckoutForm";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Finalizar pedido",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const settings = await getBusinessSettings();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="eyebrow">Último paso</p>
      <h1 className="section-title mt-2 text-4xl text-brand-carbon sm:text-5xl">Completá tus datos y enviá tu pedido</h1>
      <p className="mt-3 max-w-2xl text-sm text-brand-ash">
        No hace falta registrarse ni pagar en la web. Tu pedido se envía por WhatsApp y confirmamos disponibilidad, precio final y entrega por chat.
      </p>
      <CheckoutForm estimateNotice={settings.estimateNotice} businessName={settings.name} />
    </div>
  );
}
