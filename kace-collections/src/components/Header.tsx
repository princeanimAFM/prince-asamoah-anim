import Link from "next/link";
import { SITE } from "@/lib/site";
import { CartLink } from "./CartLink";
import { CurrencySwitch } from "./CurrencySwitch";

export const NAV = [
  { href: "/new-arrivals", label: "New in" },
  { href: "/women", label: "Women" },
  { href: "/men", label: "Men" },
  { href: "/sale", label: "Sale" },
  { href: "/about", label: "About" },
];

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`display leading-none ${className}`}>
      <span className="block text-[1.9em] tracking-tight">KACE</span>
      <span className="block text-[0.62em] tracking-[0.42em] font-semibold" style={{ fontStretch: "100%" }}>COLLECTIONS</span>
    </span>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
      {SITE.preview && (
        <p className="gutter bg-ink py-2 text-center text-xs text-paper">
          Preview: sample products only. The shop isn&apos;t taking orders yet.
        </p>
      )}
      <div className="gutter mx-auto flex max-w-7xl items-center justify-between gap-4 py-3">
        <details className="group md:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold [&::-webkit-details-marker]:hidden">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M3 7h18M3 12h18M3 17h18" />
            </svg>
            <span className="sr-only">Menu</span>
          </summary>
          <nav className="absolute inset-x-0 top-full border-b border-line bg-paper shadow-lg" aria-label="Main">
            <ul className="gutter flex flex-col py-2">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="display block py-3 text-2xl">{item.label}</Link>
                </li>
              ))}
              <li><Link href="/contact" className="block py-3 font-semibold">Contact</Link></li>
              <li><Link href="/faq" className="block py-3 font-semibold">FAQ</Link></li>
            </ul>
          </nav>
        </details>
        <Link href="/" aria-label={`${SITE.name} home`} className="text-[15px]">
          <Wordmark />
        </Link>
        <nav className="hidden md:block" aria-label="Main">
          <ul className="flex gap-7 font-semibold">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={`hover:underline underline-offset-4 ${item.href === "/sale" ? "text-clay" : ""}`}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-4">
          <CurrencySwitch />
          <CartLink />
        </div>
      </div>
      <div className="kente-band h-1.5" aria-hidden="true" />
    </header>
  );
}
