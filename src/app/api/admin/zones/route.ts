import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseZone } from "@/lib/admin-validation";
import { readJson, handleError } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const data = parseZone(await readJson(req));
    const zone = await prisma.deliveryZone.create({ data });
    return NextResponse.json({ zone }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
