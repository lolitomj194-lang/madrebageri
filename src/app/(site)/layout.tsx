import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CartDrawer } from "@/components/CartDrawer";
import { getBusinessSettings, getOpeningHours, getClosedDates } from "@/lib/settings";
import { isOpenNow, describeHours } from "@/lib/hours";

export const revalidate = 0;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, hours, closed] = await Promise.all([getBusinessSettings(), getOpeningHours(), getClosedDates()]);
  const open = isOpenNow(hours, closed.map((c) => c.date)).open;
  const hoursRows = describeHours(hours);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: settings.name,
    description: settings.slogan,
    address: { "@type": "PostalAddress", streetAddress: settings.address, addressLocality: "Paraná", addressRegion: "Entre Ríos", addressCountry: "AR" },
    servesCuisine: "Asado argentino",
    telephone: settings.whatsapp ? `+${settings.whatsapp}` : undefined,
    openingHoursSpecification: hoursRows
      .filter((h) => h.open)
      .map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: h.name, description: h.text })),
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header openNow={open} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} hours={hoursRows} />
      <WhatsAppButton number={settings.whatsapp} businessName={settings.name} />
      <CartDrawer estimateNotice={settings.estimateNotice} />
    </div>
  );
}
