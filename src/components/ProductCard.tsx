import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";

type ProductCardData = {
  slug: string;
  name: string;
  collection: string | null;
  basePrice: number;
  category: { name: string };
  images: { url: string }[];
  variants: { colorHex: string; stock: number }[];
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const inStock = product.variants.some((v) => v.stock > 0);
  const image = product.images[0]?.url ?? "https://placehold.co/800x600/1a1a1a/e5e2da?text=Vision+Equis";

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group block overflow-hidden rounded-xl border border-brand-line bg-white transition-shadow hover:shadow-xl hover:shadow-black/5"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-cream">
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
        {product.collection === "Ferrari" && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-ferrari px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow">
            Ferrari
          </span>
        )}
        {!inStock && (
          <span className="absolute right-3 top-3 rounded-full bg-brand-ink/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            Sin stock
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-[11px] uppercase tracking-wide text-brand-ink/50">{product.category.name}</p>
        <h3 className="mt-1 font-medium text-brand-ink line-clamp-1 group-hover:text-brand-gold transition-colors">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-serif text-lg text-brand-ink">
            {product.basePrice > 0 ? formatPrice(product.basePrice) : "Consultar precio"}
          </span>
          <div className="flex -space-x-1">
            {product.variants.slice(0, 4).map((v, i) => (
              <span
                key={i}
                className="h-4 w-4 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: v.colorHex }}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
