import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runSeed } from "@/lib/seed-data";

// One-time remote seed trigger for a freshly created database (e.g. right
// after the first Vercel deploy, when there is no way to run `npm run seed`
// against the production DB directly). Guarded by a shared secret and a
// "only if empty" check so it can't be used to reset real data later.
// Supports GET so it can be triggered by just visiting the URL in a browser.
async function handleSeed(secretFromRequest: string | null) {
  const secret = process.env.SEED_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "SEED_SECRET no esta configurado" }, { status: 503 });
  }
  if (secretFromRequest !== secret) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const existing = await prisma.product.count();
  if (existing > 0) {
    return NextResponse.json({ skipped: true, reason: "La base ya tiene productos", existing });
  }

  const result = await runSeed(prisma);
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(req: NextRequest) {
  return handleSeed(req.nextUrl.searchParams.get("secret"));
}

export async function POST(req: NextRequest) {
  return handleSeed(req.headers.get("x-seed-secret"));
}
