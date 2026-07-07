import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ProductInput } from "../route";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } }, variants: true, category: true },
  });
  if (!product) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body: ProductInput = await req.json();

  if (!body.name?.trim() || !body.categoryId || body.basePrice == null) {
    return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
  }
  if (!body.variants?.length) {
    return NextResponse.json({ error: "Agrega al menos una variante de color" }, { status: 400 });
  }

  const product = await prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.productVariant.deleteMany({ where: { productId: id } });

    return tx.product.update({
      where: { id },
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || null,
        collection: body.collection || null,
        basePrice: Number(body.basePrice),
        cashPrice: body.cashPrice != null ? Number(body.cashPrice) : null,
        categoryId: body.categoryId,
        featured: Boolean(body.featured),
        active: body.active ?? true,
        images: { create: body.images.map((img, i) => ({ url: img.url, order: i })) },
        variants: {
          create: body.variants.map((v) => ({
            colorName: v.colorName,
            colorHex: v.colorHex,
            lensColor: v.lensColor || null,
            sku: v.sku,
            stock: Number(v.stock),
            priceDelta: Number(v.priceDelta) || 0,
          })),
        },
      },
      include: { images: true, variants: true },
    });
  });

  return NextResponse.json(product);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
