import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { availableStock, firstImage, type ProductWithRelations } from "@/lib/products";
import { hasWholesale } from "@/lib/pricing";

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const stock = availableStock(product);
  const activeVariants = product.variants.filter((v) => v.active && v.stock > 0);

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-brand-line bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-brand-cream">
        <Image
          src={firstImage(product)}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {stock === 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-ink/80 px-3 py-1 text-xs font-semibold text-white">
            Sin stock — consultar
          </span>
        )}
        {hasWholesale(product) && (
          <span className="absolute right-3 top-3 rounded-full bg-brand-sage px-3 py-1 text-xs font-semibold text-white">
            Mayorista
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-ink-soft">
          {product.category.name}
        </p>
        <h3 className="font-serif text-lg leading-snug text-brand-ink">{product.name}</h3>
        {activeVariants.length > 0 && (
          <p className="text-xs text-brand-ink-soft">
            {activeVariants.length === 1
              ? "1 tela disponible"
              : `${activeVariants.length} telas disponibles`}
          </p>
        )}
        <div className="mt-auto pt-2">
          <p className="text-lg font-semibold text-brand-ink">{formatPrice(product.price)}</p>
          {product.cashPrice != null && product.cashPrice < product.price && (
            <p className="text-xs text-brand-sage-dark">
              {formatPrice(product.cashPrice)} con efectivo o transferencia
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
