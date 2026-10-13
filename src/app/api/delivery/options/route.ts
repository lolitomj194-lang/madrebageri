import { NextResponse } from "next/server";
import { getDeliveryOptions } from "@/lib/delivery";

export const dynamic = "force-dynamic";

export async function GET() {
  const options = await getDeliveryOptions();
  return NextResponse.json(options);
}
