import { prisma } from "@/lib/prisma";
import { CouponsManager } from "@/components/admin/CouponsManager";
import { AdminPageHeader } from "@/components/admin/ui";

export const revalidate = 0;

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <AdminPageHeader title="Promociones y cupones" subtitle="Descuentos porcentuales o fijos con vigencia, compra mínima y límite de usos. Solo se aplica un cupón por pedido; los combos con precio tachado o etiqueta se muestran como promociones en el inicio." />
      <CouponsManager coupons={coupons.map((c) => ({ ...c, validFrom: c.validFrom?.toISOString() ?? null, validTo: c.validTo?.toISOString() ?? null }))} />
    </div>
  );
}
