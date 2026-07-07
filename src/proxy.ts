import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/admin/login", "/api/admin/login", "/api/admin/logout"];

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
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
