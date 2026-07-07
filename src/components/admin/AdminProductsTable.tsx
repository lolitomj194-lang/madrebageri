"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/lib/format";

type Row = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  active: boolean;
  featured: boolean;
  collection: string | null;
  category: { name: string };
  images: { url: string }[];
  variants: { stock: number }[];
};

export function AdminProductsTable({ products }: { products: Row[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Eliminar "${name}"? Esta accion no se puede deshacer.`)) return;
    setDeletingId(id);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) {
      router.refresh();
    } else {
      alert("No se pudo eliminar el producto");
    }
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-brand-line bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-brand-line text-left text-xs uppercase tracking-wide text-brand-ink/50">
            <th className="px-4 py-3">Producto</th>
            <th className="px-4 py-3">Categoria</th>
            <th className="px-4 py-3">Precio</th>
            <th className="px-4 py-3">Stock total</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const stock = p.variants.reduce((s, v) => s + v.stock, 0);
            return (
              <tr key={p.id} className="border-b border-brand-line last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-12 shrink-0 overflow-hidden rounded bg-brand-cream">
                      {p.images[0] && (
                        <Image src={p.images[0].url} alt={p.name} fill className="object-cover" sizes="48px" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-brand-ink line-clamp-1">{p.name}</p>
                      {p.collection && <p className="text-xs text-brand-ink/50">{p.collection}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-brand-ink/70">{p.category.name}</td>
                <td className="px-4 py-3">{formatPrice(p.basePrice)}</td>
                <td className="px-4 py-3">
                  <span className={stock === 0 ? "text-brand-ferrari font-medium" : ""}>{stock}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      p.active ? "bg-green-100 text-green-700" : "bg-zinc-200 text-zinc-600"
                    }`}
                  >
                    {p.active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/productos/${p.id}`} className="text-brand-gold hover:underline">
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      disabled={deletingId === p.id}
                      className="text-brand-ferrari hover:underline disabled:opacity-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
