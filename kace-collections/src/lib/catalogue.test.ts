import { describe, expect, it } from "vitest";
import { categoriesFor, findProducts, isNewArrival, isOnSale, isSoldOut, parseAvailability, parseCategory, parseSort, PRODUCTS, type Product } from "./catalogue";

const base: Product = {
  slug: "a", name: "A", designer: "D", gender: "women", category: "dresses", price: 5000,
  description: "", details: [], sizes: [{ label: "M", stock: 1 }], addedAt: "2026-10-01",
  availability: "in-stock", photo: { src: "/x.jpg", alt: "x" },
};
const products: Product[] = [
  base,
  { ...base, slug: "b", gender: "men", category: "shirts", price: 3000, addedAt: "2026-09-01", compareAt: 4000 },
  { ...base, slug: "c", gender: "unisex", category: "bags", price: 7000, addedAt: "2026-10-10" },
];

describe("findProducts", () => {
  it("includes unisex items in both men and women", () => {
    expect(findProducts({ gender: "women" }, products).map((p) => p.slug)).toEqual(["c", "a"]);
    expect(findProducts({ gender: "men" }, products).map((p) => p.slug)).toEqual(["c", "b"]);
  });
  it("filters sale and category, and sorts by price", () => {
    expect(findProducts({ sale: true }, products).map((p) => p.slug)).toEqual(["b"]);
    expect(findProducts({ category: "bags" }, products).map((p) => p.slug)).toEqual(["c"]);
    expect(findProducts({ sort: "price-asc" }, products).map((p) => p.price)).toEqual([3000, 5000, 7000]);
  });
  it("finds new arrivals within 30 days", () => {
    const today = new Date("2026-10-19T12:00:00Z");
    expect(findProducts({ newSince: today }, products).map((p) => p.slug)).toEqual(["c", "a"]);
    expect(isNewArrival(products[1], today)).toBe(false);
  });
});

describe("helpers", () => {
  it("knows when something is on sale", () => {
    expect(isOnSale(products[1])).toBe(true);
    expect(isOnSale(base)).toBe(false);
    expect(isOnSale({ ...base, compareAt: 4000 })).toBe(false);
  });
  it("lists categories that have products", () => {
    expect(categoriesFor({ gender: "men" }, products)).toEqual(["shirts", "bags"]);
  });
  it("rejects unknown categories and sorts from the URL", () => {
    expect(parseCategory("dresses")).toBe("dresses");
    expect(parseCategory("constructor")).toBeUndefined();
    expect(parseCategory("<script>")).toBeUndefined();
    expect(parseSort("price-desc")).toBe("price-desc");
    expect(parseSort("drop table")).toBe("newest");
  });
});

describe("availability", () => {
  const made: Product = { ...base, slug: "m", availability: "made-to-order", sizes: [{ label: "M", stock: 0 }] };
  it("filters in stock and made to order", () => {
    expect(findProducts({ availability: "made-to-order" }, [...products, made]).map((p) => p.slug)).toEqual(["m"]);
    expect(findProducts({ availability: "in-stock" }, [...products, made])).toHaveLength(3);
  });
  it("never shows made-to-order pieces as sold out", () => {
    expect(isSoldOut(made)).toBe(false);
    expect(isSoldOut({ ...base, sizes: [{ label: "M", stock: 0 }] })).toBe(true);
  });
  it("parses availability from the URL safely", () => {
    expect(parseAvailability("made-to-order")).toBe("made-to-order");
    expect(parseAvailability(["in-stock"])).toBeUndefined();
    expect(parseAvailability("toString")).toBeUndefined();
  });
  it("every real product has a photo, and made-to-order ones a making time", () => {
    for (const p of PRODUCTS) {
      expect(p.photo.src).toMatch(/^\/products\/.+\.jpg$/);
      if (p.availability === "made-to-order") expect(p.makingTime).toBeTruthy();
    }
  });
});
