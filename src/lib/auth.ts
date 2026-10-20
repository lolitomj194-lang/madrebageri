import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-only-secret-change-in-production-please";
export const ADMIN_COOKIE_NAME = "agb_admin_session";

export type AdminRole = "OWNER" | "STAFF";

export type AdminTokenPayload = {
  adminId: string;
  email: string;
  name: string;
  role: AdminRole;
};

export function signAdminToken(payload: AdminTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as Partial<AdminTokenPayload>;
    if (!payload.adminId) return null;
    return {
      adminId: payload.adminId,
      email: payload.email ?? "",
      name: payload.name ?? "",
      // Sesiones firmadas antes de que existieran roles: se tratan como duena.
      role: payload.role ?? "OWNER",
    };
  } catch {
    return null;
  }
}

// Rutas del panel y de la API que puede usar el rol STAFF (carga de stock).
// Todo lo demas bajo /admin y /api/admin es solo para OWNER.
const STAFF_PREFIXES = [
  "/admin/productos",
  "/api/admin/products",
  "/api/admin/variants",
  "/api/admin/uploads",
  "/api/admin/categories",
  "/api/admin/logout",
];

export function canAccess(role: AdminRole, pathname: string) {
  if (role === "OWNER") return true;
  if (pathname === "/admin") return true;
  return STAFF_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
