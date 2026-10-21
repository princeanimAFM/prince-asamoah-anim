import Link from "next/link";
import { SITE } from "@/lib/site";
import { Wordmark } from "./Header";

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-paper">
      <div className="kente-band h-2" aria-hidden="true" />
      <div className="gutter mx-auto grid max-w-7xl gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Wordmark className="text-[15px]" />
          <p className="max-w-xs text-sm text-paper/70">{SITE.tagline}.</p>
        </div>
        <FooterList title="Shop" links={[["/shop", "Shop all"], ["/new-arrivals", "New in"], ["/women", "Women"], ["/men", "Men"], ["/lookbook", "Lookbook"], ["/custom", "Made for you"], ["/sale", "Sale"]]} />
        <FooterList title="Help" links={[["/faq", "FAQ and delivery"], ["/contact", "Contact us"], ["/about", "About KACE"]]} />
        <div className="space-y-2 text-sm text-paper/70">
          <p className="eyebrow text-paper">We deliver to</p>
          <p>{SITE.deliveryCountries.join(" and ")}</p>
          <p>Prices are charged in pounds (£).</p>
        </div>
      </div>
      <p className="gutter mx-auto max-w-7xl border-t border-paper/15 py-6 text-xs text-paper/60">
        © {new Date().getFullYear()} {SITE.name}
        {SITE.ownerName && <> · Owned and run by {SITE.ownerName}</>}
        {SITE.address && <> · {SITE.address}</>}
      </p>
    </footer>
  );
}

function FooterList({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div className="space-y-3">
      <p className="eyebrow">{title}</p>
      <ul className="space-y-2 text-sm text-paper/80">
        {links.map(([href, label]) => (
          <li key={href}><Link href={href} className="hover:text-gold">{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
