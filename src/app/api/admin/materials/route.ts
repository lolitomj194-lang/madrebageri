import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const materials = await prisma.material.findMany({
    include: { supplier: true, _count: { select: { recipeItems: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(materials);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = String(body.name ?? "").trim();
  const unit = String(body.unit ?? "").trim();
  const unitCost = Number(body.unitCost);

  if (!name || !unit) {
    return NextResponse.json({ error: "Nombre y unidad son obligatorios" }, { status: 400 });
  }
  if (!Number.isFinite(unitCost) || unitCost < 0) {
    return NextResponse.json({ error: "Precio inválido" }, { status: 400 });
  }

  const material = await prisma.material.create({
    data: {
      name,
      unit,
      unitCost: Math.round(unitCost),
      supplierId: body.supplierId || null,
      notes: body.notes?.trim() || null,
    },
    include: { supplier: true },
  });
  return NextResponse.json(material);
}
