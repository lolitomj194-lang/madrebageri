import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseProduct } from "@/lib/admin-validation";
import { readJson, handleError } from "@/lib/api-helpers";

export async function GET() {
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: [{ category: { order: "asc" } }, { order: "asc" }, { name: "asc" }] });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  try {
    const data = parseProduct(await readJson(req));
    const exists = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (exists) data.slug = `${data.slug}-${Date.now().toString(36)}`;
    const product = await prisma.product.create({ data });
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
