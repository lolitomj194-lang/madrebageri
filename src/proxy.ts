import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, canAccess, verifyAdminToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/admin/login", "/api/admin/login", "/api/admin/logout", "/api/admin/seed-init"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (isAdminPage || isAdminApi) {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const payload = token ? verifyAdminToken(token) : null;
    if (!payload) {
      if (isAdminApi) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (!canAccess(payload.role, pathname)) {
      if (isAdminApi) {
        return NextResponse.json({ error: "Sin permiso para esta sección" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/admin/productos", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
