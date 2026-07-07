import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["PENDING", "PAID", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await req.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Estado invalido" }, { status: 400 });
  }

  const current = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!current) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  if (status === "CANCELLED" && current.status !== "CANCELLED") {
    await prisma.$transaction(async (tx) => {
      for (const item of current.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
      await tx.order.update({ where: { id }, data: { status } });
    });
  } else {
    await prisma.order.update({ where: { id }, data: { status } });
  }

  return NextResponse.json({ ok: true });
}
