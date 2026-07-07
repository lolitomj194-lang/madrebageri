import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Scope = "all" | "collection" | "no-price";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const scope: Scope = body.scope;
  const collection: string | undefined = body.collection;
  const basePrice = Number(body.basePrice);
  const cashPrice = body.cashPrice != null && body.cashPrice !== "" ? Number(body.cashPrice) : null;

  if (!Number.isFinite(basePrice) || basePrice < 0) {
    return NextResponse.json({ error: "Precio tarjeta invalido" }, { status: 400 });
  }
  if (scope === "collection" && !collection) {
    return NextResponse.json({ error: "Elegi una coleccion" }, { status: 400 });
  }

  const where =
    scope === "collection"
      ? { collection }
      : scope === "no-price"
        ? { basePrice: 0 }
        : {};

  const result = await prisma.product.updateMany({
    where,
    data: { basePrice, cashPrice },
  });

  return NextResponse.json({ updated: result.count });
}
