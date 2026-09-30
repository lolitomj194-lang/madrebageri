import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Aumento (o baja) masiva de precios por porcentaje, pensada para ajustar
// todo el catalogo de una sola vez. Redondea al centenar de pesos.

export async function POST(req: NextRequest) {
  const body = await req.json();
  const percent = Number(body.percent);

  if (!Number.isFinite(percent) || percent <= -100 || percent > 500) {
    return NextResponse.json(
      { error: "Porcentaje inválido (entre -99 y 500)" },
      { status: 400 }
    );
  }

  const factor = 1 + percent / 100;
  const result = await prisma.$executeRaw`
    UPDATE "Product" SET
      "price" = GREATEST(100, ROUND("price" * ${factor}::float8 / 100.0)::int * 100),
      "cashPrice" = CASE WHEN "cashPrice" IS NULL THEN NULL
        ELSE GREATEST(100, ROUND("cashPrice" * ${factor}::float8 / 100.0)::int * 100) END,
      "wholesalePrice" = CASE WHEN "wholesalePrice" IS NULL THEN NULL
        ELSE GREATEST(100, ROUND("wholesalePrice" * ${factor}::float8 / 100.0)::int * 100) END,
      "updatedAt" = NOW()
  `;

  return NextResponse.json({ updated: Number(result) });
}
