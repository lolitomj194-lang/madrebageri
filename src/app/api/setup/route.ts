import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runSeed } from "@/lib/seed-data";

/**
 * Inicializacion unica tras el primer deploy (sin necesidad de correr comandos):
 *   POST /api/setup  con header  x-setup-token: <SETUP_TOKEN>
 * Carga los datos de ejemplo y el usuario admin SOLO si todavia no existe ningun administrador.
 */
export async function POST(req: NextRequest) {
  const expected = process.env.SETUP_TOKEN;
  if (!expected) {
    return NextResponse.json({ error: "SETUP_TOKEN no está configurado en el servidor." }, { status: 503 });
  }
  const provided = req.headers.get("x-setup-token") ?? req.nextUrl.searchParams.get("token");
  if (provided !== expected) {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }
  const admins = await prisma.adminUser.count();
  if (admins > 0) {
    return NextResponse.json({ error: "La plataforma ya fue inicializada. Ingresá en /admin/login." }, { status: 409 });
  }
  const result = await runSeed(prisma);
  return NextResponse.json({
    ok: true,
    message: `Listo: ${result.productCount} productos y ${result.comboCount} combos DE EJEMPLO cargados. Ingresá en /admin/login con ${result.adminEmail} y la contraseña ADMIN_PASSWORD configurada, y reemplazá los datos de ejemplo por los reales.`,
    adminEmail: result.adminEmail,
  });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
