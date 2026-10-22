import { describe, expect, it } from "vitest";
import { buildCheckout } from "./checkout";
import type { Product } from "./catalogue";

const product = (slug: string, price: number, stock: number, availability: Product["availability"] = "in-stock"): Product => ({
  slug, name: slug, designer: "D", gender: "unisex", category: "jackets", availability, price,
  description: "", details: [], sizes: [{ label: "M", stock }, { label: "L", stock: 1 }], addedAt: "2026-10-01",
  photo: { src: `/products/${slug}.jpg`, alt: "x" },
});
const products = [product("jacket", 9800, 2), product("made", 18500, 5, "made-to-order")];
const SITE = "https://kace.example";
const ok = { acceptedTerms: true, destination: "GB", lines: [{ slug: "jacket", size: "M", qty: 1 }] };

describe("buildCheckout", () => {
  it("prices the bag from the catalogue, not from the browser", () => {
    const r = buildCheckout({ ...ok, lines: [{ slug: "jacket", size: "M", qty: 1, price: 1 }], amount: 1 }, SITE, products);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const item = r.params.line_items![0];
    expect(item.price_data!.unit_amount).toBe(9800);
    expect(item.price_data!.currency).toBe("gbp");
    expect(item.price_data!.product_data!.images).toEqual(["https://kace.example/products/jacket.jpg"]);
  });
  it("limits quantities to stock", () => {
    const r = buildCheckout({ ...ok, lines: [{ slug: "jacket", size: "M", qty: 9 }] }, SITE, products);
    expect(r.ok && r.params.line_items![0].quantity).toBe(2);
  });
  it("refuses made-to-order pieces, unknown pieces and empty bags", () => {
    expect(buildCheckout({ ...ok, lines: [{ slug: "made", size: "M", qty: 1 }] }, SITE, products)).toEqual({ ok: false, error: "empty" });
    expect(buildCheckout({ ...ok, lines: [{ slug: "nope", size: "M", qty: 1 }] }, SITE, products)).toEqual({ ok: false, error: "empty" });
    expect(buildCheckout({ ...ok, lines: "junk" }, SITE, products)).toEqual({ ok: false, error: "empty" });
  });
  it("needs the terms accepted and a delivery country we serve", () => {
    expect(buildCheckout({ ...ok, acceptedTerms: "yes" }, SITE, products)).toEqual({ ok: false, error: "terms" });
    expect(buildCheckout({ ...ok, destination: "US" }, SITE, products)).toEqual({ ok: false, error: "destination" });
    expect(buildCheckout(null, SITE, products)).toEqual({ ok: false, error: "terms" });
  });
  it("only delivers to the chosen country, at its rate", () => {
    const r = buildCheckout({ ...ok, destination: "GH" }, SITE, products);
    if (!r.ok) throw new Error("expected ok");
    expect(r.params.shipping_address_collection!.allowed_countries).toEqual(["GH"]);
    expect(r.params.shipping_options![0].shipping_rate_data!.fixed_amount!.amount).toBe(2500);
    expect(r.params.success_url).toBe("https://kace.example/checkout/success?session_id={CHECKOUT_SESSION_ID}");
    expect(r.params.cancel_url).toBe("https://kace.example/cart");
  });
});
