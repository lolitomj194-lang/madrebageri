import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const data: {
    name?: string;
    unit?: string;
    unitCost?: number;
    supplierId?: string | null;
    notes?: string | null;
    active?: boolean;
  } = {};

  if (body.name != null) {
    const name = String(body.name).trim();
    if (!name) return NextResponse.json({ error: "El nombre no puede estar vacío" }, { status: 400 });
    data.name = name;
  }
  if (body.unit != null) data.unit = String(body.unit).trim();
  if (body.unitCost != null) {
    const unitCost = Number(body.unitCost);
    if (!Number.isFinite(unitCost) || unitCost < 0) {
      return NextResponse.json({ error: "Precio inválido" }, { status: 400 });
    }
    data.unitCost = Math.round(unitCost);
  }
  if ("supplierId" in body) data.supplierId = body.supplierId || null;
  if ("notes" in body) data.notes = body.notes?.trim() || null;
  if (body.active != null) data.active = Boolean(body.active);

  const material = await prisma.material.update({
    where: { id },
    data,
    include: { supplier: true },
  });
  return NextResponse.json(material);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usedBy = await prisma.productMaterial.count({ where: { materialId: id } });
  if (usedBy > 0) {
    return NextResponse.json(
      { error: `Este material está en la receta de ${usedBy} producto(s). Sacalo de las recetas antes de borrarlo.` },
      { status: 400 }
    );
  }
  await prisma.material.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
