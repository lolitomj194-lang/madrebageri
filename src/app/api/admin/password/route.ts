import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/current-admin";

export async function PUT(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword || String(newPassword).length < 8) {
    return NextResponse.json({ error: "La nueva contraseña debe tener al menos 8 caracteres." }, { status: 400 });
  }
  const user = await prisma.adminUser.findUnique({ where: { id: admin.adminId } });
  if (!user || !(await bcrypt.compare(String(currentPassword), user.passwordHash))) {
    return NextResponse.json({ error: "La contraseña actual no es correcta." }, { status: 400 });
  }
  await prisma.adminUser.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(String(newPassword), 10) } });
  return NextResponse.json({ ok: true });
}
