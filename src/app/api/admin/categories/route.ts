import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { ROLES, ValidationError } from "@/lib/admin-validation";
import { readJson, handleError } from "@/lib/api-helpers";
import type { AsadoRole } from "@/generated/prisma/enums";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { products: true } } } });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  try {
    const body = await readJson(req);
    const name = String(body.name ?? "").trim();
    if (!name) throw new ValidationError("El nombre es obligatorio.");
    const role = ROLES.includes(body.role as AsadoRole) ? (body.role as AsadoRole) : "CARNE";
    const last = await prisma.category.findFirst({ orderBy: { order: "desc" } });
    const category = await prisma.category.create({
      data: { name, slug: slugify(name), role, description: String(body.description ?? "").trim() || null, order: (last?.order ?? -1) + 1 },
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
