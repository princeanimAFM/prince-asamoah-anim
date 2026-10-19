import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/AddToCart";
import { Price } from "@/components/Price";
import { ProductArt } from "@/components/ProductArt";
import { ProductGrid } from "@/components/ProductCard";
import { CATEGORY_LABELS, findProducts, getProduct, PRODUCTS } from "@/lib/catalogue";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = getProduct((await params).slug);
  return product ? { title: product.name, description: product.description } : {};
}

export default async function ProductPage({ params }: Params) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const section = product.gender === "men" ? "men" : "women";
  const related = findProducts({ gender: section, category: product.category })
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4);

  return (
    <div className="gutter mx-auto max-w-7xl">
      <nav aria-label="Breadcrumb" className="py-5 text-sm text-muted">
        <Link href={`/${section}`} className="hover:underline">{section === "men" ? "Men" : "Women"}</Link>
        {" / "}
        <Link href={`/${section}?category=${product.category}`} className="hover:underline">{CATEGORY_LABELS[product.category]}</Link>
      </nav>

      <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div className="bg-sand">
          <ProductArt product={product} className="aspect-[3/4] w-full" />
          <p className="px-4 py-3 text-xs text-muted">Illustration. Product photos coming soon.</p>
        </div>

        <div className="space-y-6 md:sticky md:top-28 md:self-start">
          <div className="space-y-2">
            <p className="text-sm text-muted">{product.designer}</p>
            <h1 className="display text-4xl md:text-5xl">{product.name}</h1>
            <Price pence={product.price} compareAt={product.compareAt} className="text-xl font-semibold" />
            <p className="text-xs text-muted">Charged in pounds. Delivery worked out at checkout.</p>
          </div>
          <p className="max-w-prose">{product.description}</p>
          <AddToCart product={product} />
          <details className="border-t border-line py-4" open>
            <summary className="cursor-pointer font-semibold">Details</summary>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
              {product.details.map((d) => <li key={d}>{d}</li>)}
            </ul>
          </details>
          <details className="border-t border-line py-4">
            <summary className="cursor-pointer font-semibold">Delivery and returns</summary>
            <div className="mt-3 space-y-2 text-sm text-muted">
              <p>We deliver to the UK and Ghana. Each order is bought from the designer and checked before it&apos;s sent, so allow 2 to 3 weeks.</p>
              <p><Link href="/faq" className="underline underline-offset-4">Read delivery and returns</Link></p>
            </div>
          </details>
          <section className="border-t border-line py-4" aria-labelledby="reviews">
            <h2 id="reviews" className="font-semibold">Reviews</h2>
            <p className="mt-2 text-sm text-muted">No reviews yet. Customers who buy this piece will be able to review it.</p>
          </section>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="display mb-8 text-4xl">You might also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
