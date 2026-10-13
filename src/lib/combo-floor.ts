import { prisma } from "@/lib/prisma";
import { comboTotal, comboMeatGrams, clampPersons, type ComboLike, type ComboItemLike } from "@/lib/combo-math";
import type { ComboFloor } from "@/lib/calculator";

/**
 * Busca el combo activo que mejor representa a `persons` comensales y devuelve su precio y
 * gramos de carne para esa cantidad (escalando los extras por persona si el combo lo permite).
 * Se elige el combo con la base mas alta que no supere a `persons`; si ninguno alcanza, el de base menor.
 * Devuelve null si no hay combos activos.
 */
export async function getComboFloor(persons: number): Promise<ComboFloor | null> {
  const combos = await prisma.combo.findMany({
    where: { active: true, pricing: { in: ["SCALABLE", "FIXED"] } },
    include: { items: { include: { product: true } } },
    orderBy: { persons: "asc" },
  });
  if (combos.length === 0) return null;
  const below = combos.filter((c) => c.persons <= persons);
  const chosen = below.length ? below[below.length - 1] : combos[0];
  const like: ComboLike = chosen;
  const items: ComboItemLike[] = chosen.items.map((it) => ({
    name: it.product.name,
    unitLabel: it.product.unitLabel,
    quantity: it.quantity,
    inGrams: it.inGrams,
    perExtraPerson: it.perExtraPerson,
    saleUnit: it.product.saleUnit,
    portionMinGrams: it.product.portionMinGrams,
    portionMaxGrams: it.product.portionMaxGrams,
    unitGrams: it.product.unitGrams,
  }));
  // Si el combo no escala (FIXED o sin recargo), se toma su base tal cual.
  const scalable = chosen.pricing === "SCALABLE" && (chosen.extraPersonPrice ?? 0) > 0;
  const p = scalable ? clampPersons(like, persons) : chosen.persons;
  return {
    label: chosen.name,
    price: comboTotal(like, p),
    grams: Math.round(comboMeatGrams(like, items, p)),
    persons: p,
  };
}
