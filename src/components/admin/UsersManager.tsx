"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: "OWNER" | "STAFF";
  createdAt: string | Date;
};

export function UsersManager({ users, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState({ name: "", email: "", password: "", role: "STAFF" as "OWNER" | "STAFF" });
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordFor, setPasswordFor] = useState<Record<string, string>>({});

  async function request(url: string, method: string, body?: unknown) {
    setError(null);
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Algo salió mal");
      return false;
    }
    router.refresh();
    return true;
  }

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    setBusy("new");
    const ok = await request("/api/admin/users", "POST", draft);
    if (ok) setDraft({ name: "", email: "", password: "", role: "STAFF" });
    setBusy(null);
  }

  async function changePassword(user: UserRow) {
    const password = passwordFor[user.id];
    if (!password) return;
    setBusy(user.id);
    const ok = await request(`/api/admin/users/${user.id}`, "PATCH", { password });
    if (ok) setPasswordFor((p) => ({ ...p, [user.id]: "" }));
    setBusy(null);
  }

  async function removeUser(user: UserRow) {
    if (!confirm(`¿Eliminar el acceso de ${user.name}?`)) return;
    setBusy(user.id);
    await request(`/api/admin/users/${user.id}`, "DELETE");
    setBusy(null);
  }

  return (
    <div className="space-y-5">
      <form onSubmit={addUser} className="rounded-2xl border border-brand-line bg-white p-5">
        <h2 className="mb-1 font-serif text-lg text-brand-ink">Nuevo acceso</h2>
        <p className="mb-3 text-xs text-brand-ink-soft">
          <strong>Carga de stock</strong> solo ve productos, telas y fotos (ideal para la community
          manager). <strong>Dueña</strong> ve todo: ventas, costos, clientes y usuarios.
        </p>
        <div className="grid gap-2 sm:grid-cols-[1.5fr_2fr_1.5fr_1.2fr_auto]">
          <input
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            required
            placeholder="Nombre"
            className="input-field"
          />
          <input
            type="email"
            value={draft.email}
            onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
            required
            placeholder="Email (para entrar)"
            className="input-field"
          />
          <input
            type="text"
            value={draft.password}
            onChange={(e) => setDraft((d) => ({ ...d, password: e.target.value }))}
            required
            minLength={6}
            placeholder="Contraseña"
            className="input-field"
          />
          <select
            value={draft.role}
            onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value as "OWNER" | "STAFF" }))}
            className="input-field"
          >
            <option value="STAFF">Carga de stock</option>
            <option value="OWNER">Dueña</option>
          </select>
          <button type="submit" disabled={busy === "new"} className="btn-primary">
            Crear
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </form>

      <div className="overflow-hidden rounded-2xl border border-brand-line bg-white">
        <table className="w-full text-sm">
          <thead className="bg-brand-cream text-left text-xs uppercase tracking-wide text-brand-ink/60">
            <tr>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Cambiar contraseña</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-line">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <span className="font-medium text-brand-ink">{u.name}</span>
                  {u.id === currentUserId && <span className="ml-2 text-xs text-brand-ink-soft">(vos)</span>}
                  <span className="block text-xs text-brand-ink-soft">{u.email}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      u.role === "OWNER" ? "bg-brand-terracotta/10 text-brand-terracotta" : "bg-brand-cream text-brand-ink-soft"
                    }`}
                  >
                    {u.role === "OWNER" ? "Dueña" : "Carga de stock"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={passwordFor[u.id] ?? ""}
                      onChange={(e) => setPasswordFor((p) => ({ ...p, [u.id]: e.target.value }))}
                      placeholder="Nueva contraseña"
                      className="input-field w-44"
                    />
                    <button
                      type="button"
                      onClick={() => changePassword(u)}
                      disabled={busy === u.id || !(passwordFor[u.id]?.length >= 6)}
                      className="rounded-full border border-brand-line px-3 py-1.5 text-xs font-medium hover:border-brand-terracotta disabled:opacity-40"
                    >
                      Guardar
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {u.id !== currentUserId && (
                    <button
                      onClick={() => removeUser(u)}
                      disabled={busy === u.id}
                      className="text-xs text-red-600 underline disabled:opacity-40"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
