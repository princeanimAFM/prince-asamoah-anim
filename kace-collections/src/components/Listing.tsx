import Link from "next/link";
import { CATEGORY_LABELS, categoriesFor, findProducts, parseCategory, parseSort, type Filter } from "@/lib/catalogue";
import { ProductGrid } from "./ProductCard";

type Props = {
  title: string;
  intro: string;
  basePath: string;
  filter: Omit<Filter, "category" | "sort">;
  searchParams: { category?: string; sort?: string };
};

const SORTS = [
  ["newest", "Newest"],
  ["price-asc", "Price: low to high"],
  ["price-desc", "Price: high to low"],
] as const;

export function Listing({ title, intro, basePath, filter, searchParams }: Props) {
  const category = parseCategory(searchParams.category);
  const sort = parseSort(searchParams.sort);
  const products = findProducts({ ...filter, category, sort });
  const categories = categoriesFor(filter);
  const href = (c?: string, s?: string) => {
    const q = new URLSearchParams();
    if (c) q.set("category", c);
    if (s && s !== "newest") q.set("sort", s);
    const qs = q.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div className="gutter mx-auto max-w-7xl">
      <header className="border-b border-line py-10 md:py-14">
        <h1 className="display text-5xl md:text-7xl">{title}</h1>
        <p className="mt-3 max-w-xl text-muted">{intro}</p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4 py-5">
        <nav aria-label="Categories" className="-mx-1 flex max-w-full gap-2 overflow-x-auto px-1 pb-1">
          <FilterLink href={href(undefined, sort)} active={!category}>All</FilterLink>
          {categories.map((c) => (
            <FilterLink key={c} href={href(c, sort)} active={category === c}>
              {CATEGORY_LABELS[c]}
            </FilterLink>
          ))}
        </nav>
        <nav aria-label="Sort" className="flex items-center gap-3 text-sm">
          <span className="text-muted">Sort:</span>
          {SORTS.map(([value, label]) => (
            <Link key={value} href={href(category, value)} aria-current={sort === value ? "true" : undefined}
              className={sort === value ? "font-bold underline underline-offset-4" : "hover:underline underline-offset-4"}>
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <p className="mb-6 text-sm text-muted">{products.length} {products.length === 1 ? "item" : "items"}</p>
      {products.length ? (
        <ProductGrid products={products} />
      ) : (
        <div className="bg-sand px-6 py-16 text-center">
          <p className="display text-3xl">Nothing here yet</p>
          <p className="mt-2 text-muted">New pieces arrive from Ghana every week.</p>
          <Link href="/new-arrivals" className="mt-6 inline-block bg-ink px-6 py-3 font-semibold text-paper">See what&apos;s new</Link>
        </div>
      )}
    </div>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} aria-current={active ? "true" : undefined}
      className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold ${
        active ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"
      }`}>
      {children}
    </Link>
  );
}
