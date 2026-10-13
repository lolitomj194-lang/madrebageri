import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { ROLES, ValidationError } from "@/lib/admin-validation";
import { readJson, handleError, type RouteParams } from "@/lib/api-helpers";
import type { AsadoRole } from "@/generated/prisma/enums";

export async function PUT(req: NextRequest, { params }: RouteParams<{ id: string }>) {
  const { id } = await params;
  try {
    const body = await readJson(req);
    const name = String(body.name ?? "").trim();
    if (!name) throw new ValidationError("El nombre es obligatorio.");
    const role = ROLES.includes(body.role as AsadoRole) ? (body.role as AsadoRole) : "CARNE";
    const order = Number.isFinite(Number(body.order)) ? Number(body.order) : undefined;
    const category = await prisma.category.update({
      where: { id },
      data: { name, slug: slugify(name), role, description: String(body.description ?? "").trim() || null, order },
    });
    return NextResponse.json({ category });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams<{ id: string }>) {
  const { id } = await params;
  try {
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) throw new ValidationError("La categoría tiene productos. Movelos a otra categoría antes de eliminarla.");
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
