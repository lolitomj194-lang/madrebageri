import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAdminToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Completa email y contrasena" }, { status: 400 });
  }

  const admin = await prisma.adminUser.findUnique({ where: { email: String(email).toLowerCase().trim() } });
  if (!admin) {
    return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 });
  }

  const token = signAdminToken({ adminId: admin.id, email: admin.email, name: admin.name });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
