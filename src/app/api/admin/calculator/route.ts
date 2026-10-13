import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCalculatorSettings } from "@/lib/admin-validation";
import { readJson, handleError } from "@/lib/api-helpers";

export async function PUT(req: NextRequest) {
  try {
    const data = parseCalculatorSettings(await readJson(req));
    const settings = await prisma.calculatorSettings.upsert({ where: { id: "main" }, update: data, create: { id: "main", ...data } });
    return NextResponse.json({ settings });
  } catch (err) {
    return handleError(err);
  }
}
