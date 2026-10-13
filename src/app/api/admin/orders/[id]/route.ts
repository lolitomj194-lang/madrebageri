import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS } from "@/lib/order-status";
import { readJson, handleError, type RouteParams } from "@/lib/api-helpers";
import type { OrderStatus } from "@/generated/prisma/enums";

export async function PATCH(req: NextRequest, { params }: RouteParams<{ id: string }>) {
  const { id } = await params;
  const body = await readJson(req);
  const data: { status?: OrderStatus; finalTotal?: number | null; paidAt?: Date | null; adminNotes?: string | null } = {};

  if (body.status !== undefined) {
    const status = String(body.status) as OrderStatus;
    if (!ORDER_STATUS.some((s) => s.value === status)) return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    data.status = status;
  }
  if (body.finalTotal !== undefined) {
    const n = body.finalTotal === null || body.finalTotal === "" ? null : Math.round(Number(body.finalTotal));
    if (n !== null && (!Number.isFinite(n) || n < 0)) return NextResponse.json({ error: "Importe inválido" }, { status: 400 });
    data.finalTotal = n;
  }
  if (body.paid !== undefined) data.paidAt = body.paid ? new Date() : null;
  if (body.adminNotes !== undefined) data.adminNotes = String(body.adminNotes).trim().slice(0, 2000) || null;

  try {
    const order = await prisma.order.update({ where: { id }, data });
    return NextResponse.json({ order });
  } catch (err) {
    return handleError(err);
  }
}
