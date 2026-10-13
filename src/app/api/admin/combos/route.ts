import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCombo } from "@/lib/admin-validation";
import { readJson, handleError } from "@/lib/api-helpers";

export async function GET() {
  const combos = await prisma.combo.findMany({ include: { items: { include: { product: true }, orderBy: { order: "asc" } } }, orderBy: [{ order: "asc" }, { name: "asc" }] });
  return NextResponse.json({ combos });
}

export async function POST(req: NextRequest) {
  try {
    const { items, ...data } = parseCombo(await readJson(req));
    const exists = await prisma.combo.findUnique({ where: { slug: data.slug } });
    if (exists) data.slug = `${data.slug}-${Date.now().toString(36)}`;
    const combo = await prisma.combo.create({ data: { ...data, items: { create: items } } });
    return NextResponse.json({ combo }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
