import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCoupon } from "@/lib/admin-validation";
import { readJson, handleError } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const data = parseCoupon(await readJson(req));
    const coupon = await prisma.coupon.create({ data });
    return NextResponse.json({ coupon }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
