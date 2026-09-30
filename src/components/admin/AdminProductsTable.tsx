"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";

type ProductRow = {
  id: string;
  name: string;
  price: number;
  cashPrice: number | null;
  wholesalePrice: number | null;
  wholesaleMinQty: number | null;
  featured: boolean;
  active: boolean;
  category: { name: string };
  images: { url: string }[];
  variants: {
    id: string;
    name: string;
    stock: number;
    active: boolean;
    imageUrl: string | null;
  }[];
};

export function AdminProductsTable({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const [busyVariant, setBusyVariant] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function setVariantStock(variantId: string, stock: number) {
    setBusyVariant(variantId);
    try {
      await fetch(`/api/admin/variants/${variantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock }),
      });
      router.refresh();
    } finally {
      setBusyVariant(null);
    }
  }

  async function handleDelete(product: ProductRow) {
    if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "No se pudo eliminar");
        return;
      }
      router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  if (products.length === 0) {
    return (
      <p className="rounded-2xl border border-brand-line bg-white p-8 text-center text-sm text-brand-ink-soft">
        Todavía no hay productos.{" "}
        <Link href="/admin/productos/nuevo" className="text-brand-terracotta underline">
          Creá el primero
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.id} className="rounded-2xl border border-brand-line bg-white p-4">
          <div className="flex flex-wrap items-start gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-cream">
              {(product.images[0]?.url || product.variants.find((v) => v.imageUrl)?.imageUrl) && (
                <Image
                  src={product.images[0]?.url ?? (product.variants.find((v) => v.imageUrl)?.imageUrl as string)}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-brand-ink">{product.name}</p>
                {!product.active && (
                  <span className="rounded-full bg-brand-sand px-2 py-0.5 text-xs">Oculto</span>
                )}
                {product.featured && (
                  <span className="rounded-full bg-brand-terracotta/10 px-2 py-0.5 text-xs text-brand-terracotta">
                    Destacado
                  </span>
                )}
              </div>
              <p className="text-xs text-brand-ink-soft">
                {product.category.name} · {formatPrice(product.price)}
                {product.cashPrice != null && ` · efectivo ${formatPrice(product.cashPrice)}`}
                {product.wholesalePrice != null &&
                  ` · mayorista ${formatPrice(product.wholesalePrice)} (${product.wholesaleMinQty}+)`}
              </p>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {product.variants.map((variant) => (
                  <span
                    key={variant.id}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
                      variant.stock === 0 || !variant.active
                        ? "border-brand-line bg-brand-cream text-brand-ink-soft line-through"
                        : "border-brand-line bg-white text-brand-ink"
                    }`}
                  >
                    {variant.name} · {variant.stock}u
                    {variant.stock > 0 && variant.active && (
                      <button
                        onClick={() => setVariantStock(variant.id, 0)}
                        disabled={busyVariant === variant.id}
                        title="Marcar agotada"
                        className="font-bold text-brand-terracotta hover:text-brand-terracotta-dark disabled:opacity-40"
                      >
                        agotar
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <Link
                href={`/admin/productos/${product.id}`}
                className="rounded-full border border-brand-line px-4 py-1.5 text-sm hover:border-brand-terracotta"
              >
                Editar
              </Link>
              <button
                onClick={() => handleDelete(product)}
                disabled={deleting === product.id}
                className="rounded-full border border-red-200 px-4 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {deleting === product.id ? "..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
