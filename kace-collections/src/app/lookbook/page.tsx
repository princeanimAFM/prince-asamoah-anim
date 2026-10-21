import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/Prose";
import { ProductCard } from "@/components/ProductCard";
import { getProduct } from "@/lib/catalogue";
import { LOOKS } from "@/lib/lookbook";

export const metadata: Metadata = {
  title: "Lookbook",
  description: "Looks from KACE COLLECTIONS shoots. Shop the pieces or have your own version made in Ghana.",
};

export default function Lookbook() {
  return (
    <div className="gutter mx-auto max-w-7xl">
      <PageHeader title="Lookbook" intro="How we wear it. Shop the pieces, or ask us to make a look for you, in your size and your colours." />
      <div className="space-y-24 py-12">
        {LOOKS.map((look, i) => {
          const products = look.products.map((s) => getProduct(s)).filter((p) => p !== undefined);
          return (
            <article key={look.slug} id={look.slug} className="grid scroll-mt-32 items-center gap-8 md:grid-cols-2 md:gap-14">
              <figure className={i % 2 ? "md:order-2" : undefined}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={look.photos[0].src} alt={look.photos[0].alt} loading={i ? "lazy" : "eager"} className="aspect-[2/3] w-full object-cover" />
                {look.photos.length > 1 && (
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {look.photos.slice(1).map((photo) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={photo.src} src={photo.src} alt={photo.alt} loading="lazy" className="aspect-[3/4] w-full object-cover" />
                    ))}
                  </div>
                )}
                {look.photos.some((p) => p.credit) && (
                  <figcaption className="mt-2 text-xs text-muted">Photos: {[...new Set(look.photos.map((p) => p.credit).filter(Boolean))].join(", ")}</figcaption>
                )}
              </figure>
              <div className="space-y-6">
                <p className="eyebrow text-forest">Look {String(i + 1).padStart(2, "0")}</p>
                <h2 className="display text-5xl md:text-6xl">{look.title}</h2>
                <p className="max-w-prose text-lg">{look.story}</p>
                <div>
                  <h3 className="mb-2 font-semibold">In this look</h3>
                  <ul className="list-disc space-y-1 pl-5 text-muted">
                    {look.wearing.map((w) => <li key={w}>{w}</li>)}
                  </ul>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href={`/custom?look=${look.slug}`} className="bg-ink px-7 py-4 font-semibold text-paper hover:bg-forest">
                    Make this look for me
                  </Link>
                  {products.length > 0 && (
                    <a href={`#${look.slug}-pieces`} className="border border-ink px-7 py-4 font-semibold hover:bg-ink hover:text-paper">Shop the pieces</a>
                  )}
                </div>
                {products.length > 0 && (
                  <ul id={`${look.slug}-pieces`} className="grid grid-cols-2 gap-4 pt-4">
                    {products.map((p) => <li key={p.slug}><ProductCard product={p} /></li>)}
                  </ul>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <section className="bg-sand p-8 md:p-14">
        <h2 className="display text-4xl md:text-5xl">Got your own idea?</h2>
        <p className="mt-3 max-w-xl text-lg text-muted">
          Send us a sketch or a picture of a style you love, and our designers in Ghana will make it for you.
        </p>
        <Link href="/custom" className="mt-6 inline-block bg-ink px-7 py-4 font-semibold text-paper hover:bg-forest">How custom orders work</Link>
      </section>
    </div>
  );
}
