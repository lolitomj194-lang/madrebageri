import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCombo } from "@/lib/admin-validation";
import { readJson, handleError, type RouteParams } from "@/lib/api-helpers";

export async function PUT(req: NextRequest, { params }: RouteParams<{ id: string }>) {
  const { id } = await params;
  try {
    const { items, ...data } = parseCombo(await readJson(req));
    const clash = await prisma.combo.findFirst({ where: { slug: data.slug, id: { not: id } } });
    if (clash) data.slug = `${data.slug}-${Date.now().toString(36)}`;
    const combo = await prisma.$transaction(async (tx) => {
      await tx.comboItem.deleteMany({ where: { comboId: id } });
      return tx.combo.update({ where: { id }, data: { ...data, items: { create: items } } });
    });
    return NextResponse.json({ combo });
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams<{ id: string }>) {
  const { id } = await params;
  const body = await readJson(req);
  const data: { active?: boolean; featured?: boolean } = {};
  if (typeof body.active === "boolean") data.active = body.active;
  if (typeof body.featured === "boolean") data.featured = body.featured;
  try {
    const combo = await prisma.combo.update({ where: { id }, data });
    return NextResponse.json({ combo });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams<{ id: string }>) {
  const { id } = await params;
  try {
    const used = await prisma.orderItem.count({ where: { comboId: id } });
    if (used > 0) {
      await prisma.combo.update({ where: { id }, data: { active: false } });
      return NextResponse.json({ deactivated: true, message: "El combo tiene pedidos asociados: se desactivó en lugar de eliminarse." });
    }
    await prisma.combo.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
