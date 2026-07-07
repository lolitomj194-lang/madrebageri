import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }
  const slug = slugify(name);
  const count = await prisma.category.count();
  const category = await prisma.category.create({
    data: { name: name.trim(), slug, order: count },
  });
  return NextResponse.json(category);
}
