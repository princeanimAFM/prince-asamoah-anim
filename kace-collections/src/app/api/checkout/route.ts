// Starts a Stripe Checkout payment for the in-stock pieces in the bag and returns the payment
// page address. Card details are entered on Stripe's page and never reach this site.
import Stripe from "stripe";
import { buildCheckout, CHECKOUT_ERRORS } from "@/lib/checkout";
import { checkoutStatus } from "@/lib/checkout-config";

export async function POST(request: Request) {
  const status = checkoutStatus();
  if (!status.ready) return Response.json({ error: "Checkout isn't open yet." }, { status: 503 });

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 10_000) return Response.json({ error: "That request is too large." }, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 400 });
  }

  const result = buildCheckout(body, status.siteUrl);
  if (!result.ok) return Response.json({ error: CHECKOUT_ERRORS[result.error] }, { status: 400 });

  try {
    const stripe = new Stripe(status.secretKey, { timeout: 15_000, maxNetworkRetries: 1 });
    const session = await stripe.checkout.sessions.create(result.params);
    if (!session.url) throw new Error("Stripe returned no checkout URL");
    return Response.json({ url: session.url });
  } catch (error) {
    // Logged without customer details: the request holds only product codes and quantities.
    console.error("Stripe checkout failed:", error instanceof Error ? error.message : "unknown error");
    return Response.json({ error: "We couldn't start the payment. Please try again in a moment." }, { status: 502 });
  }
}
