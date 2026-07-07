import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true, images: { orderBy: { order: "asc" } }, variants: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export type ProductInput = {
  name: string;
  description?: string;
  collection?: string;
  basePrice: number;
  categoryId: string;
  featured: boolean;
  active: boolean;
  images: { url: string }[];
  variants: {
    colorName: string;
    colorHex: string;
    lensColor?: string;
    sku: string;
    stock: number;
    priceDelta: number;
  }[];
};

export async function POST(req: NextRequest) {
  const body: ProductInput = await req.json();

  if (!body.name?.trim() || !body.categoryId || body.basePrice == null) {
    return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
  }
  if (!body.variants?.length) {
    return NextResponse.json({ error: "Agrega al menos una variante de color" }, { status: 400 });
  }

  let slug = slugify(body.name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-5)}`;
  }

  const product = await prisma.product.create({
    data: {
      name: body.name.trim(),
      slug,
      description: body.description?.trim() || null,
      collection: body.collection || null,
      basePrice: Number(body.basePrice),
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

  return NextResponse.json(product);
}
