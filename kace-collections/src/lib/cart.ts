// Shopping cart: a list of lines kept in the browser. Prices are never stored in the cart;
// they are always looked up from the catalogue, and checked again on the server at checkout.
import { getProduct, type Product } from "./catalogue";

export type CartLine = { slug: string; size: string; qty: number };

export type CartAction =
  | { type: "add"; slug: string; size: string; qty?: number }
  | { type: "setQty"; slug: string; size: string; qty: number }
  | { type: "remove"; slug: string; size: string }
  | { type: "clear" }
  | { type: "replace"; lines: CartLine[] };

export const MAX_QTY_PER_LINE = 10;

// Made-to-order pieces can't go in the bag: they're requested and quoted instead.
function stockFor(slug: string, size: string, products?: Product[]): number {
  const product = getProduct(slug, products);
  if (!product || product.availability !== "in-stock") return 0;
  return product.sizes.find((s) => s.label === size)?.stock ?? 0;
}

function clamp(qty: number, slug: string, size: string, products?: Product[]): number {
  const max = Math.min(MAX_QTY_PER_LINE, stockFor(slug, size, products));
  return Math.max(0, Math.min(Math.floor(qty), max));
}

export function cartReducer(lines: CartLine[], action: CartAction, products?: Product[]): CartLine[] {
  switch (action.type) {
    case "add": {
      const existing = lines.find((l) => l.slug === action.slug && l.size === action.size);
      const qty = clamp((existing?.qty ?? 0) + (action.qty ?? 1), action.slug, action.size, products);
      if (qty === 0) return lines;
      if (existing) return lines.map((l) => (l === existing ? { ...l, qty } : l));
      return [...lines, { slug: action.slug, size: action.size, qty }];
    }
    case "setQty": {
      const qty = clamp(action.qty, action.slug, action.size, products);
      return lines
        .map((l) => (l.slug === action.slug && l.size === action.size ? { ...l, qty } : l))
        .filter((l) => l.qty > 0);
    }
    case "remove":
      return lines.filter((l) => !(l.slug === action.slug && l.size === action.size));
    case "clear":
      return [];
    case "replace":
      return sanitiseLines(action.lines, products);
  }
}

/** Keeps only lines for real products and sizes, with quantities limited to stock. */
export function sanitiseLines(input: unknown, products?: Product[]): CartLine[] {
  if (!Array.isArray(input)) return [];
  const out: CartLine[] = [];
  for (const raw of input.slice(0, 50)) {
    if (!raw || typeof raw !== "object") continue;
    const { slug, size, qty } = raw as Record<string, unknown>;
    if (typeof slug !== "string" || typeof size !== "string" || typeof qty !== "number") continue;
    const q = clamp(qty, slug, size, products);
    if (q > 0 && !out.some((l) => l.slug === slug && l.size === size)) out.push({ slug, size, qty: q });
  }
  return out;
}

export type PricedLine = CartLine & { product: Product; lineTotal: number };

export function priceCart(lines: CartLine[], products?: Product[]) {
  const priced: PricedLine[] = [];
  for (const line of lines) {
    const product = getProduct(line.slug, products);
    if (product) priced.push({ ...line, product, lineTotal: product.price * line.qty });
  }
  return {
    lines: priced,
    count: priced.reduce((n, l) => n + l.qty, 0),
    subtotal: priced.reduce((n, l) => n + l.lineTotal, 0),
  };
}
