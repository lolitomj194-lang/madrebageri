import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Ajuste rapido de una tela desde la tabla de productos (sin abrir el
// formulario): cambiar stock o marcarla agotada.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const data: { stock?: number; active?: boolean } = {};
  if (body.stock != null) {
    const stock = Number(body.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json({ error: "Stock inválido" }, { status: 400 });
    }
    data.stock = stock;
  }
  if (body.active != null) data.active = Boolean(body.active);

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
  }

  const variant = await prisma.variant.update({ where: { id }, data });
  return NextResponse.json(variant);
}
