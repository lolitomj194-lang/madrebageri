"use client";

import { useRouter } from "next/navigation";

export function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className="text-xs font-semibold uppercase tracking-wider text-brand-cream/60 transition-colors hover:text-brand-cream">
      Cerrar sesión
    </button>
  );
}
