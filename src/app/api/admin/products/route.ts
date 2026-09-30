import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { validateProductInput, type ProductInput } from "@/lib/product-input";

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: { orderBy: { order: "asc" } },
      variants: { orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const body: ProductInput = await req.json();
  const error = validateProductInput(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

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
      price: Number(body.price),
      cashPrice: body.cashPrice ? Number(body.cashPrice) : null,
      wholesalePrice: body.wholesalePrice ? Number(body.wholesalePrice) : null,
      wholesaleMinQty: body.wholesaleMinQty ? Number(body.wholesaleMinQty) : null,
      categoryId: body.categoryId,
      featured: Boolean(body.featured),
      active: body.active ?? true,
      images: { create: body.images.map((img, i) => ({ url: img.url, order: i })) },
      variants: {
        create: body.variants.map((v, i) => ({
          name: v.name.trim(),
          imageUrl: v.imageUrl || null,
          stock: Number(v.stock) || 0,
          priceDelta: Number(v.priceDelta) || 0,
          active: v.active ?? true,
          order: i,
        })),
      },
    },
    include: { images: true, variants: true },
  });

  return NextResponse.json(product);
}
