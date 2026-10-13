import { NextResponse } from "next/server";
import { ValidationError } from "@/lib/admin-validation";

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const data = await req.json();
    return data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function handleError(err: unknown) {
  if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 });
  const code = (err as { code?: string })?.code;
  if (code === "P2002") return NextResponse.json({ error: "Ya existe un registro con ese nombre o código." }, { status: 409 });
  if (code === "P2025") return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  console.error(err);
  return NextResponse.json({ error: "Error inesperado." }, { status: 500 });
}

export type RouteParams<T> = { params: Promise<T> };
