import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/current-admin";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: { name?: string; password?: string; passwordHash?: string; role?: "OWNER" | "STAFF" } = {};

  if (body.name != null) data.name = String(body.name).trim();
  if (body.role === "OWNER" || body.role === "STAFF") data.role = body.role;
  if (body.password) {
    if (String(body.password).length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }
    data.passwordHash = await bcrypt.hash(String(body.password), 10);
  }
  delete data.password;

  if (data.role === "STAFF") {
    const owners = await prisma.adminUser.count({ where: { role: "OWNER", id: { not: id } } });
    if (owners === 0) {
      return NextResponse.json({ error: "Tiene que quedar al menos una dueña" }, { status: 400 });
    }
  }

  const user = await prisma.adminUser.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  return NextResponse.json(user);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await getCurrentAdmin();
  if (me?.adminId === id) {
    return NextResponse.json({ error: "No podés borrar tu propio usuario" }, { status: 400 });
  }
  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (target.role === "OWNER") {
    const owners = await prisma.adminUser.count({ where: { role: "OWNER" } });
    if (owners <= 1) {
      return NextResponse.json({ error: "Tiene que quedar al menos una dueña" }, { status: 400 });
    }
  }
  await prisma.adminUser.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
