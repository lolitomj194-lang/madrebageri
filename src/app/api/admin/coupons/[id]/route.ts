import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCoupon } from "@/lib/admin-validation";
import { readJson, handleError, type RouteParams } from "@/lib/api-helpers";

export async function PUT(req: NextRequest, { params }: RouteParams<{ id: string }>) {
  const { id } = await params;
  try {
    const data = parseCoupon(await readJson(req));
    const coupon = await prisma.coupon.update({ where: { id }, data });
    return NextResponse.json({ coupon });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams<{ id: string }>) {
  const { id } = await params;
  try {
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
