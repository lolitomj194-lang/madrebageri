import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseProduct } from "@/lib/admin-validation";
import { readJson, handleError, type RouteParams } from "@/lib/api-helpers";

export async function PUT(req: NextRequest, { params }: RouteParams<{ id: string }>) {
  const { id } = await params;
  try {
    const data = parseProduct(await readJson(req));
    const clash = await prisma.product.findFirst({ where: { slug: data.slug, id: { not: id } } });
    if (clash) data.slug = `${data.slug}-${Date.now().toString(36)}`;
    const product = await prisma.product.update({ where: { id }, data });
    return NextResponse.json({ product });
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams<{ id: string }>) {
  const { id } = await params;
  const body = await readJson(req);
  const data: { active?: boolean; featured?: boolean; imageUrl?: string | null } = {};
  if (typeof body.active === "boolean") data.active = body.active;
  if (typeof body.featured === "boolean") data.featured = body.featured;
  if (typeof body.imageUrl === "string") data.imageUrl = body.imageUrl.trim().slice(0, 600) || null;
  try {
    const product = await prisma.product.update({ where: { id }, data });
    return NextResponse.json({ product });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams<{ id: string }>) {
  const { id } = await params;
  try {
    const used = await prisma.orderItem.count({ where: { productId: id } });
    const inCombos = await prisma.comboItem.count({ where: { productId: id } });
    if (used > 0 || inCombos > 0) {
      // Tiene historial: se desactiva en lugar de borrar para no romper pedidos/combos.
      await prisma.product.update({ where: { id }, data: { active: false } });
      return NextResponse.json({ deactivated: true, message: "El producto tiene pedidos o combos asociados: se desactivó en lugar de eliminarse." });
    }
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
