import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseZone } from "@/lib/admin-validation";
import { readJson, handleError, type RouteParams } from "@/lib/api-helpers";

export async function PUT(req: NextRequest, { params }: RouteParams<{ id: string }>) {
  const { id } = await params;
  try {
    const data = parseZone(await readJson(req));
    const zone = await prisma.deliveryZone.update({ where: { id }, data });
    return NextResponse.json({ zone });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams<{ id: string }>) {
  const { id } = await params;
  try {
    await prisma.deliveryZone.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
