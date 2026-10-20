import { prisma } from "@/lib/prisma";
import { getCostSettings } from "@/lib/cost-settings";
import { CostSettingsForm } from "@/components/admin/CostSettingsForm";
import { MaterialsManager } from "@/components/admin/MaterialsManager";

export const dynamic = "force-dynamic";

export default async function CostsPage() {
  const [settings, materials, suppliers] = await Promise.all([
    getCostSettings(),
    prisma.material.findMany({
      include: { supplier: true, _count: { select: { recipeItems: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-brand-ink">Costos</h1>
        <p className="mt-1 max-w-2xl text-sm text-brand-ink-soft">
          El costo de cada producto sale de tres partes: <strong>materiales</strong> (su receta ×
          precio actual), <strong>mano de obra</strong> (minutos × valor de la hora) y{" "}
          <strong>gastos fijos</strong> repartidos. La receta y los minutos se cargan en cada producto;
          acá van los materiales y los parámetros generales.
        </p>
      </div>

      <CostSettingsForm settings={settings} />
      <MaterialsManager materials={materials} suppliers={suppliers} />
    </div>
  );
}
