import Link from "next/link";
import { findProducts, PRODUCTS } from "@/lib/catalogue";
import { ProductArt } from "@/components/ProductArt";
import { ProductGrid } from "@/components/ProductCard";

// Rebuilt hourly so "New" tags and new arrivals stay current.
export const revalidate = 3600;

export default function Home() {
  const newest = findProducts({ sort: "newest" }).slice(0, 4);
  const onSale = findProducts({ sale: true }).slice(0, 4);
  const heroPieces = ["adwoa-kente-wrap-dress", "kwame-fugu-smock", "ama-woven-tote"].map((s) => PRODUCTS.find((p) => p.slug === s)!);
  const women = PRODUCTS.find((p) => p.slug === "efua-wax-print-maxi")!;
  const men = PRODUCTS.find((p) => p.slug === "yaw-kente-trim-shirt")!;

  return (
    <>
      <section className="gutter mx-auto grid max-w-7xl items-center gap-10 py-10 md:grid-cols-[1.1fr_1fr] md:py-16">
        <div className="space-y-6">
          <p className="eyebrow text-forest">Designer fashion from Ghana</p>
          <h1 className="display text-[clamp(3.2rem,9vw,7.5rem)]">
            Made in Ghana.<br />Worn <span className="text-gold">everywhere.</span>
          </h1>
          <p className="max-w-md text-lg text-muted">
            Kente, wax print, smocks, shoes and bags from independent designers in Ghana, delivered to your door in the UK and Ghana.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/women" className="bg-ink px-7 py-4 font-semibold text-paper hover:bg-forest">Shop women</Link>
            <Link href="/men" className="border border-ink px-7 py-4 font-semibold hover:bg-ink hover:text-paper">Shop men</Link>
          </div>
        </div>
        <div className="grid grid-cols-[1.3fr_1fr] gap-3">
          <Link href={`/products/${heroPieces[0].slug}`} className="row-span-2 bg-sand">
            <ProductArt product={heroPieces[0]} className="h-full w-full" />
          </Link>
          {heroPieces.slice(1).map((p) => (
            <Link key={p.slug} href={`/products/${p.slug}`} className="bg-sand">
              <ProductArt product={p} className="aspect-[3/4] w-full" />
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-sand">
        <ul className="gutter mx-auto grid max-w-7xl gap-6 py-6 text-sm sm:grid-cols-3">
          <li><strong className="block">Straight from the makers</strong><span className="text-muted">Every piece comes from a designer or weaver in Ghana.</span></li>
          <li><strong className="block">UK and Ghana delivery</strong><span className="text-muted">Tracked delivery, with updates at every step.</span></li>
          <li><strong className="block">Secure checkout</strong><span className="text-muted">Pay by card or Apple Pay. Mobile money coming soon.</span></li>
        </ul>
      </section>

      <Section title="New arrivals" href="/new-arrivals" linkLabel="See all new in">
        <ProductGrid products={newest} />
      </Section>

      <section className="gutter mx-auto mt-20 grid max-w-7xl gap-4 md:grid-cols-2">
        {[
          { href: "/women", label: "Women", sub: "Dresses, tops, sandals and more", product: women },
          { href: "/men", label: "Men", sub: "Smocks, shirts, trousers and slides", product: men },
        ].map((tile) => (
          <Link key={tile.href} href={tile.href} className="group relative block overflow-hidden bg-sand">
            <ProductArt product={tile.product} className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-[1.03]" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-6 text-paper">
              <p className="display text-5xl">{tile.label}</p>
              <p className="mt-1 text-sm">{tile.sub} →</p>
            </div>
          </Link>
        ))}
      </section>

      {onSale.length > 0 && (
        <Section title="On sale" href="/sale" linkLabel="Shop the sale" accent>
          <ProductGrid products={onSale} />
        </Section>
      )}

      <section className="gutter mx-auto mt-20 max-w-7xl">
        <div className="grid gap-8 bg-ink p-8 text-paper md:grid-cols-[1fr_1.2fr] md:p-14">
          <h2 className="display text-4xl md:text-6xl">From the workshop to your wardrobe</h2>
          <div className="space-y-4 text-paper/80">
            <p>
              KACE COLLECTIONS works directly with designers, tailors and weavers across Ghana, from kente weavers in
              Bonwire to shoemakers in Tema. When you order, we buy from the maker, check every piece, and send it to you.
            </p>
            <Link href="/about" className="inline-block font-semibold text-gold underline underline-offset-4">Our story</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Section({ title, href, linkLabel, accent, children }: { title: string; href: string; linkLabel: string; accent?: boolean; children: React.ReactNode }) {
  return (
    <section className="gutter mx-auto mt-20 max-w-7xl">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 className={`display text-4xl md:text-6xl ${accent ? "text-clay" : ""}`}>{title}</h2>
        <Link href={href} className="shrink-0 font-semibold underline underline-offset-4">{linkLabel}</Link>
      </div>
      {children}
    </section>
  );
}
