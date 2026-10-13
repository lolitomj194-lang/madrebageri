import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseHour, ValidationError } from "@/lib/admin-validation";
import { readJson, handleError } from "@/lib/api-helpers";

/** Guarda los 7 dias de una vez. */
export async function PUT(req: NextRequest) {
  try {
    const body = await readJson(req);
    const rows = Array.isArray(body.hours) ? (body.hours as Record<string, unknown>[]) : [];
    if (rows.length !== 7) throw new ValidationError("Se esperan los 7 días de la semana.");
    const parsed = rows.map(parseHour);
    for (const h of parsed) {
      if (h.open && h.openTime >= h.closeTime) throw new ValidationError("La hora de apertura debe ser anterior a la de cierre.");
    }
    await prisma.$transaction(
      parsed.map((h) => prisma.openingHour.upsert({ where: { dayOfWeek: h.dayOfWeek }, update: h, create: h }))
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
