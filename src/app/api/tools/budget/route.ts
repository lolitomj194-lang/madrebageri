import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCalculatorSettings } from "@/lib/settings";
import { toClientProduct } from "@/lib/catalog";
import { buildBudgetPlan, type BudgetPreference } from "@/lib/calculator";

const PREFS: BudgetPreference[] = ["economico", "equilibrado", "premium"];

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const budget = Math.max(0, Math.floor(Number(body.budget) || 0));
  const persons = Math.min(200, Math.max(1, Math.floor(Number(body.persons) || 1)));
  if (budget <= 0) return NextResponse.json({ error: "Ingresá un presupuesto válido." }, { status: 400 });

  let deliveryFee = 0;
  if (body.zoneId) {
    const zone = await prisma.deliveryZone.findFirst({ where: { id: String(body.zoneId), active: true } });
    if (zone) deliveryFee = zone.fee;
  }

  const [settings, products] = await Promise.all([
    getCalculatorSettings(),
    prisma.product.findMany({ where: { active: true, recommendable: true }, include: { category: true }, orderBy: [{ order: "asc" }] }),
  ]);
  const preference = settings.levelsEnabled && PREFS.includes(body.preference as BudgetPreference) ? (body.preference as BudgetPreference) : "equilibrado";
  const result = buildBudgetPlan(products.map(toClientProduct), settings, {
    budget,
    persons,
    preference,
    includeAccessories: Boolean(body.includeAccessories),
    deliveryFee,
  });
  return NextResponse.json(result);
}
