import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCostSettings } from "@/lib/cost-settings";

export async function GET() {
  return NextResponse.json(await getCostSettings());
}

const NUMERIC_FIELDS = [
  "ownerMonthlySalary",
  "employeeDailyRate",
  "employeeDaysPerWeek",
  "productiveHoursPerMonth",
  "fixedMonthlyCosts",
  "estimatedMonthlyUnits",
  "wholesaleMarginPercent",
  "retailMultiplier",
  "mpFeePercent",
] as const;

const INTEGER_FIELDS = new Set([
  "ownerMonthlySalary",
  "employeeDailyRate",
  "productiveHoursPerMonth",
  "fixedMonthlyCosts",
  "estimatedMonthlyUnits",
  "wholesaleMarginPercent",
]);

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const data: Record<string, number> = {};

  for (const field of NUMERIC_FIELDS) {
    if (body[field] == null || body[field] === "") continue;
    const value = Number(body[field]);
    if (!Number.isFinite(value) || value < 0) {
      return NextResponse.json({ error: `Valor inválido en ${field}` }, { status: 400 });
    }
    data[field] = INTEGER_FIELDS.has(field) ? Math.round(value) : value;
  }

  await getCostSettings();
  const settings = await prisma.costSettings.update({ where: { id: "default" }, data });
  return NextResponse.json(settings);
}
