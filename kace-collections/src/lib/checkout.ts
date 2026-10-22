// Turns a bag sent from the browser into a Stripe Checkout request. Everything that affects the
// price is decided here on the server from the catalogue: the browser only says which pieces,
// sizes and quantities, and where to deliver.
import type Stripe from "stripe";
import { sanitiseLines, priceCart } from "./cart";
import { PRODUCTS, type Product } from "./catalogue";
import { DELIVERY, parseDestination } from "./delivery";

export type CheckoutError = "empty" | "destination" | "terms";

export type CheckoutResult =
  | { ok: true; params: Stripe.Checkout.SessionCreateParams }
  | { ok: false; error: CheckoutError };

export const CHECKOUT_ERRORS: Record<CheckoutError, string> = {
  empty: "Your bag is empty, or the pieces in it have sold out. Please check your bag.",
  destination: "Choose where to deliver your order.",
  terms: "Please agree to the terms of sale to continue.",
};

export function buildCheckout(body: unknown, siteUrl: string, products: Product[] = PRODUCTS): CheckoutResult {
  const input = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  if (input.acceptedTerms !== true) return { ok: false, error: "terms" };
  const destination = parseDestination(input.destination);
  if (!destination) return { ok: false, error: "destination" };
  // Drops unknown pieces, made-to-order pieces, sold-out sizes and limits quantities to stock.
  const cart = priceCart(sanitiseLines(input.lines, products), products);
  if (!cart.lines.length) return { ok: false, error: "empty" };

  const rate = DELIVERY[destination];
  return {
    ok: true,
    params: {
      mode: "payment",
      locale: "en-GB",
      line_items: cart.lines.map(({ product, size, qty }) => ({
        quantity: qty,
        price_data: {
          currency: "gbp",
          unit_amount: product.price,
          product_data: {
            name: product.sizes.length > 1 ? `${product.name} (size ${size})` : product.name,
            images: [new URL(product.photo.src, siteUrl).toString()],
            metadata: { slug: product.slug, size },
          },
        },
      })),
      shipping_address_collection: { allowed_countries: [destination] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: rate.label,
            fixed_amount: { amount: rate.amount, currency: "gbp" },
            delivery_estimate: {
              minimum: { unit: "business_day", value: rate.days[0] },
              maximum: { unit: "business_day", value: rate.days[1] },
            },
          },
        },
      ],
      // Couriers need a phone number, especially for deliveries in Ghana.
      phone_number_collection: { enabled: true },
      allow_promotion_codes: true,
      // What was ordered, so the owner can see it in the Stripe dashboard.
      metadata: { items: cart.lines.map((l) => `${l.product.slug}:${l.size}:${l.qty}`).join(",").slice(0, 500) },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cart`,
    },
  };
}
