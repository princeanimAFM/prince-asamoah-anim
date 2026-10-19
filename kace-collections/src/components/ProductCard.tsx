import Link from "next/link";
import { isNewArrival, isOnSale, totalStock, type Product } from "@/lib/catalogue";
import { Price } from "./Price";
import { ProductArt } from "./ProductArt";

export function ProductCard({ product, isNew }: { product: Product; isNew?: boolean }) {
  const soldOut = totalStock(product) === 0;
  const tag = soldOut ? "Sold out" : isOnSale(product) ? "Sale" : isNew ? "New" : null;
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative overflow-hidden bg-sand">
        <ProductArt product={product} className="aspect-[3/4] w-full transition-transform duration-500 group-hover:scale-[1.03]" />
        {tag && (
          <span
            className={`eyebrow absolute left-3 top-3 px-2 py-1 ${
              tag === "Sale" ? "bg-clay text-paper" : tag === "Sold out" ? "bg-paper text-muted" : "bg-ink text-paper"
            }`}
          >
            {tag}
          </span>
        )}
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-xs text-muted">{product.designer}</p>
        <h3 className="font-semibold leading-snug group-hover:underline underline-offset-4">{product.name}</h3>
        <Price pence={product.price} compareAt={product.compareAt} className="text-sm font-semibold" />
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  const now = new Date();
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <li key={p.slug}>
          <ProductCard product={p} isNew={isNewArrival(p, now)} />
        </li>
      ))}
    </ul>
  );
}
