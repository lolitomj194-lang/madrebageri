import { prisma } from "@/lib/prisma";
import { ZonesManager } from "@/components/admin/ZonesManager";
import { AdminPageHeader } from "@/components/admin/ui";

export const revalidate = 0;

export default async function AdminZonesPage() {
  const zones = await prisma.deliveryZone.findMany({ orderBy: { order: "asc" } });
  return (
    <div>
      <AdminPageHeader title="Zonas y envíos" subtitle="Barrios cubiertos, tarifas, compra mínima y envío gratis. Las direcciones fuera de zona no se aceptan automáticamente." />
      <ZonesManager zones={zones} />
    </div>
  );
}
