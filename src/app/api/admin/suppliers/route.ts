import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const suppliers = await prisma.supplier.findMany({
    include: { _count: { select: { materials: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(suppliers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }
  const supplier = await prisma.supplier.create({
    data: {
      name,
      phone: body.phone?.trim() || null,
      notes: body.notes?.trim() || null,
    },
  });
  return NextResponse.json(supplier);
}
