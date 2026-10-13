"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, Notice } from "@/components/admin/ui";

type Category = { id: string; name: string; role: string; order: number; _count?: { products: number } };
const ROLES = ["CARNE", "ACHURA", "EMBUTIDO", "EXTRA", "ACCESORIO", "FUEGO"];

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState("CARNE");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiFetch("/api/admin/categories", { method: "POST", body: JSON.stringify({ name, role }) });
      setName("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  async function save(c: Category) {
    try {
      await apiFetch(`/api/admin/categories/${c.id}`, { method: "PUT", body: JSON.stringify(c) });
      setEditing(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  async function remove(c: Category) {
    if (!confirm(`¿Eliminar la categoría "${c.name}"?`)) return;
    try {
      await apiFetch(`/api/admin/categories/${c.id}`, { method: "DELETE" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <details className="rounded-2xl border border-brand-line bg-white p-5">
      <summary className="cursor-pointer font-display text-lg uppercase">Categorías ({categories.length})</summary>
      <ul className="mt-4 divide-y divide-brand-line text-sm">
        {categories.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center gap-2 py-2">
            {editing?.id === c.id ? (
              <>
                <input className="input-field max-w-[200px]" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                <select className="input-field max-w-[150px]" value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })}>
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
                <input className="input-field max-w-[80px]" type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} />
                <button type="button" className="btn btn-dark btn-sm" onClick={() => save(editing)}>Guardar</button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(null)}>Cancelar</button>
              </>
            ) : (
              <>
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-brand-ash">{c.role} · {c._count?.products ?? 0} productos · orden {c.order}</span>
                <span className="ml-auto flex gap-2">
                  <button type="button" className="text-xs underline" onClick={() => setEditing(c)}>Editar</button>
                  <button type="button" className="text-xs text-brand-ember underline" onClick={() => remove(c)}>Eliminar</button>
                </span>
              </>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={create} className="mt-4 flex flex-wrap gap-2">
        <input className="input-field max-w-[240px]" placeholder="Nueva categoría" value={name} onChange={(e) => setName(e.target.value)} required />
        <select className="input-field max-w-[160px]" value={role} onChange={(e) => setRole(e.target.value)}>
          {ROLES.map((r) => <option key={r}>{r}</option>)}
        </select>
        <button type="submit" className="btn btn-dark btn-sm">Agregar</button>
      </form>
      {error && <div className="mt-3"><Notice tone="error">{error}</Notice></div>}
    </details>
  );
}
