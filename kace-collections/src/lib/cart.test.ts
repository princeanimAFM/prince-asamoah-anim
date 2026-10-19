import { describe, expect, it } from "vitest";
import { cartReducer, priceCart, sanitiseLines, type CartLine } from "./cart";
import type { Product } from "./catalogue";

const p = (slug: string, price: number, stock: number): Product => ({
  slug, name: slug, designer: "D", gender: "women", category: "dresses", price,
  description: "", details: [], sizes: [{ label: "M", stock }, { label: "L", stock: 0 }], addedAt: "2026-10-01",
  art: { silhouette: "dress", pattern: "solid", colors: ["#000"] },
});
const products = [p("a", 5000, 3), p("b", 2500, 20)];
const run = (lines: CartLine[], action: Parameters<typeof cartReducer>[1]) => cartReducer(lines, action, products);

describe("cartReducer", () => {
  it("adds and merges lines, limited to stock", () => {
    let lines = run([], { type: "add", slug: "a", size: "M" });
    lines = run(lines, { type: "add", slug: "a", size: "M", qty: 5 });
    expect(lines).toEqual([{ slug: "a", size: "M", qty: 3 }]);
  });
  it("won't add sold-out sizes or unknown products", () => {
    expect(run([], { type: "add", slug: "a", size: "L" })).toEqual([]);
    expect(run([], { type: "add", slug: "zzz", size: "M" })).toEqual([]);
  });
  it("caps a line at 10", () => {
    expect(run([], { type: "add", slug: "b", size: "M", qty: 15 })[0].qty).toBe(10);
  });
  it("updates and removes", () => {
    const lines = [{ slug: "b", size: "M", qty: 2 }];
    expect(run(lines, { type: "setQty", slug: "b", size: "M", qty: 4 })[0].qty).toBe(4);
    expect(run(lines, { type: "setQty", slug: "b", size: "M", qty: 0 })).toEqual([]);
    expect(run(lines, { type: "remove", slug: "b", size: "M" })).toEqual([]);
  });
});

describe("sanitiseLines", () => {
  it("drops junk saved in the browser", () => {
    const saved = [
      { slug: "a", size: "M", qty: 99 },
      { slug: "a", size: "M", qty: 1 },
      { slug: "nope", size: "M", qty: 1 },
      { slug: "b", size: "M", qty: "2" },
      null,
      "x",
    ];
    expect(sanitiseLines(saved, products)).toEqual([{ slug: "a", size: "M", qty: 3 }]);
    expect(sanitiseLines("not a list", products)).toEqual([]);
  });
});

describe("priceCart", () => {
  it("prices lines from the catalogue", () => {
    const cart = priceCart([{ slug: "a", size: "M", qty: 2 }, { slug: "b", size: "M", qty: 1 }, { slug: "gone", size: "M", qty: 1 }], products);
    expect(cart.subtotal).toBe(12500);
    expect(cart.count).toBe(3);
    expect(cart.lines).toHaveLength(2);
  });
});
