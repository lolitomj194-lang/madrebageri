"use client";

import { useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/lib/cart-store";
import { hasWholesale } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import { site, whatsappLink } from "@/lib/site";
import type { ProductWithRelations } from "@/lib/products";

export function ProductDetailClient({ product }: { product: ProductWithRelations }) {
  const addItem = useCartStore((s) => s.addItem);
  const activeVariants = product.variants.filter((v) => v.active);
  const buyableVariants = activeVariants.filter((v) => v.stock > 0);

  const [selectedId, setSelectedId] = useState<string | null>(
    buyableVariants[0]?.id ?? activeVariants[0]?.id ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const selected = activeVariants.find((v) => v.id === selectedId) ?? null;

  const galleryImages = [
    ...(selected?.imageUrl ? [selected.imageUrl] : []),
    ...product.images.map((img) => img.url),
  ];
  const mainImage = galleryImages[0] ?? "/placeholder-product.svg";
  const [viewedImage, setViewedImage] = useState<string | null>(null);
  const displayImage = viewedImage ?? mainImage;

  const price = product.price + (selected?.priceDelta ?? 0);
  const cashPrice =
    product.cashPrice != null ? product.cashPrice + (selected?.priceDelta ?? 0) : null;

  const canBuy = selected != null && selected.stock > 0;

  const consultMessage = `Hola ${site.name}! Vi "${product.name}" en la tienda y quiero consultar por las telas disponibles.`;

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Galeria */}
      <div className="space-y-3">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-brand-line bg-brand-cream">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
        {galleryImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {galleryImages.map((url) => (
              <button
                key={url}
                onClick={() => setViewedImage(url)}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                  displayImage === url ? "border-brand-terracotta" : "border-transparent"
                }`}
              >
                <Image src={url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-brand-terracotta">
            {product.category.name}
          </p>
          <h1 className="mt-1 font-serif text-3xl text-brand-ink sm:text-4xl">{product.name}</h1>
        </div>

        <div>
          <p className="text-3xl font-semibold text-brand-ink">{formatPrice(price)}</p>
          {cashPrice != null && cashPrice < price && (
            <p className="mt-1 text-sm text-brand-sage-dark">
              {formatPrice(cashPrice)} pagando con efectivo o transferencia
            </p>
          )}
          {hasWholesale(product) && (
            <p className="mt-2 inline-block rounded-lg bg-brand-sage/15 px-3 py-2 text-sm text-brand-sage-dark">
              <strong>Precio mayorista:</strong>{" "}
              {formatPrice((product.wholesalePrice as number) + (selected?.priceDelta ?? 0))} c/u
              llevando {product.wholesaleMinQty}+ unidades (podés combinar telas)
            </p>
          )}
        </div>

        {product.description && (
          <p className="whitespace-pre-line text-sm leading-relaxed text-brand-ink-soft">
            {product.description}
          </p>
        )}

        {/* Selector de telas */}
        {activeVariants.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold text-brand-ink">
              Telas y diseños disponibles hoy
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {activeVariants.map((variant) => {
                const soldOut = variant.stock === 0;
                const isSelected = variant.id === selectedId;
                return (
                  <button
                    key={variant.id}
                    onClick={() => {
                      setSelectedId(variant.id);
                      setViewedImage(null);
                      setQuantity(1);
                    }}
                    className={`flex items-center gap-2 rounded-xl border p-2 text-left transition-colors ${
                      isSelected
                        ? "border-brand-terracotta bg-brand-terracotta/5"
                        : "border-brand-line bg-white hover:border-brand-terracotta/50"
                    } ${soldOut ? "opacity-50" : ""}`}
                  >
                    {variant.imageUrl && (
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                        <Image src={variant.imageUrl} alt={variant.name} fill sizes="48px" className="object-cover" />
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium text-brand-ink">
                        {variant.name}
                      </span>
                      <span className="block text-[0.7rem] text-brand-ink-soft">
                        {soldOut ? "Agotada" : `Stock: ${variant.stock}`}
                        {variant.priceDelta !== 0 &&
                          ` · ${variant.priceDelta > 0 ? "+" : ""}${formatPrice(variant.priceDelta)}`}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-brand-ink-soft">
              Las telas rotan según disponibilidad. ¿Buscás otra? Consultanos, seguro
              tenemos algo para vos.
            </p>
          </div>
        )}

        {/* Compra */}
        <div className="space-y-3">
          {canBuy ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full border border-brand-line bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2.5 text-brand-ink-soft hover:text-brand-ink"
                  aria-label="Restar uno"
                >
                  −
                </button>
                <span className="min-w-8 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(selected.stock, q + 1))}
                  className="px-4 py-2.5 text-brand-ink-soft hover:text-brand-ink"
                  aria-label="Sumar uno"
                >
                  +
                </button>
              </div>
              <button
                onClick={() =>
                  addItem(
                    {
                      productId: product.id,
                      variantId: selected.id,
                      slug: product.slug,
                      name: product.name,
                      variantLabel: selected.name,
                      image: selected.imageUrl ?? mainImage,
                      pricing: {
                        price: product.price,
                        cashPrice: product.cashPrice,
                        wholesalePrice: product.wholesalePrice,
                        wholesaleMinQty: product.wholesaleMinQty,
                      },
                      priceDelta: selected.priceDelta,
                      maxStock: selected.stock,
                    },
                    quantity
                  )
                }
                className="btn-primary flex-1"
              >
                Agregar al carrito
              </button>
            </div>
          ) : (
            <p className="rounded-xl bg-brand-sand px-4 py-3 text-sm text-brand-ink">
              Este producto está momentáneamente sin stock, pero las telas van y
              vienen: escribinos y te contamos qué hay disponible o te lo hacemos
              a pedido.
            </p>
          )}

          <a
            href={whatsappLink(consultMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary w-full"
          >
            Consultar telas por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
