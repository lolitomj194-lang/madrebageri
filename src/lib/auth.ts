import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-only-secret-change-in-production-please";
export const ADMIN_COOKIE_NAME = "ve_admin_session";

export type AdminTokenPayload = {
  adminId: string;
  email: string;
  name: string;
};

export function signAdminToken(payload: AdminTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
  } catch {
    return null;
  }
}
