import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ValidationError } from "@/lib/admin-validation";
import { readJson, handleError } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await readJson(req);
    const date = String(body.date ?? "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new ValidationError("Fecha inválida.");
    const closed = await prisma.closedDate.upsert({
      where: { date },
      update: { reason: String(body.reason ?? "").trim() || null },
      create: { date, reason: String(body.reason ?? "").trim() || null },
    });
    return NextResponse.json({ closed }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await readJson(req);
    await prisma.closedDate.delete({ where: { id: String(body.id ?? "") } });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
