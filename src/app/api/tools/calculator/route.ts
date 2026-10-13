import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCalculatorSettings } from "@/lib/settings";
import { toClientProduct } from "@/lib/catalog";
import { buildPlan, type Appetite, type Level } from "@/lib/calculator";

const APPETITES: Appetite[] = ["poco", "normal", "abundante"];
const LEVELS: Level[] = ["economico", "clasico", "premium"];

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const persons = Math.min(200, Math.max(1, Math.floor(Number(body.persons) || 1)));
  const children = Math.min(persons, Math.max(0, Math.floor(Number(body.children) || 0)));
  const appetite = APPETITES.includes(body.appetite as Appetite) ? (body.appetite as Appetite) : "normal";
  const level = LEVELS.includes(body.level as Level) ? (body.level as Level) : "clasico";

  const [settings, products] = await Promise.all([
    getCalculatorSettings(),
    prisma.product.findMany({ where: { active: true, recommendable: true }, include: { category: true }, orderBy: [{ order: "asc" }] }),
  ]);
  const plan = buildPlan(products.map(toClientProduct), settings, {
    persons,
    children,
    appetite,
    level,
    includeAchuras: Boolean(body.includeAchuras),
    includeEmbutidos: Boolean(body.includeEmbutidos),
  });
  return NextResponse.json({ plan, params: { gramsPerAdult: settings.gramsPerAdult } });
}
