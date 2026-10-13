import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toClientProduct } from "@/lib/catalog";
import type { AsadoRole } from "@/generated/prisma/enums";

const ROLES: AsadoRole[] = ["CARNE", "ACHURA", "EMBUTIDO", "EXTRA", "ACCESORIO", "FUEGO"];

export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role");
  const where: { active: boolean; role?: AsadoRole } = { active: true };
  if (role && ROLES.includes(role as AsadoRole)) where.role = role as AsadoRole;
  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ products: products.map(toClientProduct) });
}
