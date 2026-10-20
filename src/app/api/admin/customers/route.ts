import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const customers = await prisma.customer.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }
  const customer = await prisma.customer.create({
    data: {
      name,
      phone: body.phone?.trim() || null,
      city: body.city?.trim() || null,
      isWholesale: Boolean(body.isWholesale),
      notes: body.notes?.trim() || null,
    },
  });
  return NextResponse.json(customer);
}
