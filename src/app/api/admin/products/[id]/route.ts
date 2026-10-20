import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeRecipe, validateProductInput, type ProductInput } from "@/lib/product-input";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      variants: { orderBy: { order: "asc" } },
      materials: { include: { material: true } },
      category: true,
    },
  });
  if (!product) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body: ProductInput = await req.json();
  const error = validateProductInput(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const product = await prisma.$transaction(async (tx) => {
    // Las imagenes y la receta se reemplazan enteras; las telas se actualizan
    // por id para no romper referencias de pedidos ni resetear stock.
    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.productMaterial.deleteMany({ where: { productId: id } });

    const keptIds = body.variants.filter((v) => v.id).map((v) => v.id as string);
    await tx.variant.deleteMany({
      where: { productId: id, id: { notIn: keptIds } },
    });

    for (const [i, v] of body.variants.entries()) {
      const data = {
        name: v.name.trim(),
        imageUrl: v.imageUrl || null,
        stock: Number(v.stock) || 0,
        priceDelta: Number(v.priceDelta) || 0,
        active: v.active ?? true,
        order: i,
      };
      if (v.id) {
        await tx.variant.update({ where: { id: v.id }, data });
      } else {
        await tx.variant.create({ data: { ...data, productId: id } });
      }
    }

    return tx.product.update({
      where: { id },
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || null,
        price: Number(body.price),
        cashPrice: body.cashPrice ? Number(body.cashPrice) : null,
        wholesalePrice: body.wholesalePrice ? Number(body.wholesalePrice) : null,
        wholesaleMinQty: body.wholesaleMinQty ? Number(body.wholesaleMinQty) : null,
        categoryId: body.categoryId,
        featured: Boolean(body.featured),
        active: body.active ?? true,
        laborMinutes: Math.max(0, Number(body.laborMinutes) || 0),
        images: { create: body.images.map((img, i) => ({ url: img.url, order: i })) },
        materials: { create: normalizeRecipe(body.materials) },
      },
      include: { images: true, variants: { orderBy: { order: "asc" } }, materials: true },
    });
  });

  return NextResponse.json(product);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
