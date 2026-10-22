import Link from "next/link";
import { findProducts, PRODUCTS } from "@/lib/catalogue";
import { LOOKS } from "@/lib/lookbook";
import { Photo } from "@/components/Photo";
import { ProductImage } from "@/components/ProductImage";
import { ProductGrid } from "@/components/ProductCard";

export default function Home() {
  const newest = findProducts({ sort: "newest" }).slice(0, 4);
  const onSale = findProducts({ sale: true }).slice(0, 4);
  const heroPieces = ["patchwork-corduroy-set", "patchwork-denim-jacket"].map((s) => PRODUCTS.find((p) => p.slug === s)!);
  const heroLook = LOOKS.find((l) => l.slug === "cream-and-black")!;
  const readyNow = PRODUCTS.find((p) => p.slug === "patchwork-denim-jacket")!;
  const madeForYou = PRODUCTS.find((p) => p.slug === "patchwork-corduroy-set")!;

  return (
    <>
      <section className="gutter mx-auto grid max-w-7xl items-center gap-10 py-10 md:grid-cols-[1.1fr_1fr] md:py-16">
        <div className="space-y-6">
          <p className="eyebrow text-forest">Designer fashion from Ghana</p>
          <h1 className="display text-[clamp(3.2rem,9vw,7.5rem)]">
            Made in Ghana.<br />Worn <span className="text-gold">everywhere.</span>
          </h1>
          <p className="max-w-md text-lg text-muted">
            Patchwork corduroy, denim and more from independent designers in Ghana. Buy pieces ready to send, or have them made for you, delivered in the UK and Ghana.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/women" className="bg-ink px-7 py-4 font-semibold text-paper hover:bg-forest">Shop women</Link>
            <Link href="/men" className="border border-ink px-7 py-4 font-semibold hover:bg-ink hover:text-paper">Shop men</Link>
          </div>
        </div>
        <div className="grid grid-cols-[1.3fr_1fr] gap-3">
          <Link href={`/lookbook#${heroLook.slug}`} className="row-span-2">
            <Photo src={heroLook.photos[0].src} alt={heroLook.photos[0].alt} className="h-full min-h-80 w-full" sizes="(min-width: 768px) 30vw, 58vw" priority focus="50% 30%" />
          </Link>
          {heroPieces.map((p) => (
            <Link key={p.slug} href={`/products/${p.slug}`}>
              <ProductImage product={p} className="aspect-[3/4] w-full" sizes="(min-width: 768px) 20vw, 40vw" priority />
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-sand">
        <ul className="gutter mx-auto grid max-w-7xl gap-6 py-6 text-sm sm:grid-cols-3">
          <li><strong className="block">In stock or made for you</strong><span className="text-muted">Buy what&apos;s ready now, or have a piece made in your size.</span></li>
          <li><strong className="block">UK and Ghana delivery</strong><span className="text-muted">Tracked delivery, with updates at every step.</span></li>
          <li><strong className="block">Secure checkout</strong><span className="text-muted">Pay by card or Apple Pay. Mobile money coming soon.</span></li>
        </ul>
      </section>

      <Section title="New arrivals" href="/new-arrivals" linkLabel="See all new in">
        <ProductGrid products={newest} />
      </Section>

      <section className="gutter mx-auto mt-20 grid max-w-7xl gap-4 md:grid-cols-2">
        {[
          { href: "/shop?availability=in-stock", label: "Ready to send", sub: "In stock and posted within days", product: readyNow },
          { href: "/shop?availability=made-to-order", label: "Made to order", sub: "Made for you by the designer, in your size", product: madeForYou },
        ].map((tile) => (
          <Link key={tile.href} href={tile.href} className="group relative block overflow-hidden bg-sand">
            <ProductImage product={tile.product} className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-[1.03]" sizes="(min-width: 768px) 50vw, 100vw" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-6 text-paper">
              <p className="display text-5xl">{tile.label}</p>
              <p className="mt-1 text-sm">{tile.sub} →</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="gutter mx-auto mt-20 grid max-w-7xl items-center gap-8 md:grid-cols-[1fr_1.1fr]">
        <Link href="/lookbook" className="group block overflow-hidden bg-sand">
          <Photo src={LOOKS[0].photos[0].src} alt={LOOKS[0].photos[0].alt} className="aspect-[4/5] w-full transition-transform duration-500 group-hover:scale-[1.03]" sizes="(min-width: 768px) 45vw, 100vw" focus="50% 35%" />
        </Link>
        <div className="space-y-5">
          <p className="eyebrow text-forest">Lookbook and custom orders</p>
          <h2 className="display text-5xl md:text-7xl">Seen a look you love? We&apos;ll make it for you.</h2>
          <p className="max-w-md text-lg text-muted">
            Browse how we style our pieces, then shop them, or ask our designers in Ghana to make your own version, in your
            size and colours. Got your own design? Send it to us.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/lookbook" className="bg-ink px-7 py-4 font-semibold text-paper hover:bg-forest">See the Lookbook</Link>
            <Link href="/custom" className="border border-ink px-7 py-4 font-semibold hover:bg-ink hover:text-paper">How custom orders work</Link>
          </div>
        </div>
      </section>

      {onSale.length > 0 && (
        <Section title="On sale" href="/sale" linkLabel="Shop the sale" accent>
          <ProductGrid products={onSale} />
        </Section>
      )}

      <section className="gutter mx-auto mt-20 max-w-7xl">
        <div className="grid gap-8 bg-ink p-8 text-paper md:grid-cols-[1fr_1.2fr] md:items-center md:p-14">
          <figure className="space-y-2">
            <Photo src="/products/kwadwoman-patchwork-shoot.jpg" alt="Two models in Kwadwo Man patchwork corduroy jackets and trousers" className="aspect-[1656/1748] w-full" sizes="(min-width: 768px) 40vw, 100vw" />
            <figcaption className="text-xs text-paper/60">Patchwork corduroy by Kwadwo Man</figcaption>
          </figure>
          <div className="space-y-4 text-paper/80">
            <h2 className="display text-4xl text-paper md:text-6xl">From the workshop to your wardrobe</h2>
            <p>
              KACE COLLECTIONS works directly with designers, tailors and weavers across Ghana, from patchwork and denim
              workshops in Accra to leather workers in Tema. When you order, we buy from the maker, check every piece, and send it to you.
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
