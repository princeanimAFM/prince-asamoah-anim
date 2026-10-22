"use client";
import Link from "next/link";
import { useState } from "react";
import type { CartLine } from "@/lib/cart";
import { DELIVERY, type Destination } from "@/lib/delivery";

type Props = {
  lines: CartLine[];
  subtotal: number;
  format: (pence: number) => string;
  enabled: boolean;
  testMode: boolean;
};

// Delivery choice, terms and the button that sends the customer to Stripe's secure payment page.
export function Checkout({ lines, subtotal, format, enabled, testMode }: Props) {
  const [destination, setDestination] = useState<Destination>("GB");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const rate = DELIVERY[destination];

  async function pay() {
    if (!accepted) { setError("Please agree to the terms of sale to continue."); return; }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines, destination, acceptedTerms: true }),
      });
      const data: { url?: string; error?: string } = await res.json().catch(() => ({}));
      // Only ever follow a link to Stripe's own checkout pages.
      if (res.ok && data.url && new URL(data.url).hostname === "checkout.stripe.com") {
        window.location.assign(data.url);
        return;
      }
      setError(data.error ?? "We couldn't start the payment. Please try again.");
    } catch {
      setError("We couldn't reach the payment page. Check your connection and try again.");
    }
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      <fieldset className="space-y-2 text-sm">
        <legend className="mb-1 font-semibold">Deliver to</legend>
        {(Object.keys(DELIVERY) as Destination[]).map((d) => (
          <label key={d} className="flex cursor-pointer items-center justify-between gap-3 border border-line bg-paper px-3 py-2">
            <span className="flex items-center gap-2">
              <input type="radio" name="destination" value={d} checked={destination === d} onChange={() => setDestination(d)} className="accent-ink" />
              {DELIVERY[d].country}
            </span>
            <span className="tabular-nums text-muted">{format(DELIVERY[d].amount)}</span>
          </label>
        ))}
      </fieldset>

      <dl className="space-y-2 border-t border-line pt-3 text-sm">
        <div className="flex justify-between"><dt>Delivery ({rate.days[0]} to {rate.days[1]} working days)</dt><dd className="tabular-nums">{format(rate.amount)}</dd></div>
        <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd className="tabular-nums">{format(subtotal + rate.amount)}</dd></div>
      </dl>
      {destination === "GH" && (
        <p className="text-xs text-muted">Orders to Ghana may be charged import duty on arrival, paid to the courier. [to confirm]</p>
      )}

      <label className="flex cursor-pointer items-start gap-2 text-sm">
        <input id="accept-terms" type="checkbox" checked={accepted} onChange={(e) => { setAccepted(e.target.checked); setError(""); }} className="mt-1 accent-ink" />
        <span>
          I agree to the <Link href="/terms" className="underline underline-offset-4" target="_blank">terms of sale</Link> and have read the{" "}
          <Link href="/privacy" className="underline underline-offset-4" target="_blank">privacy notice</Link>.
        </span>
      </label>

      <button type="button" onClick={pay} disabled={!enabled || busy}
        className="w-full bg-ink px-6 py-4 font-semibold text-paper hover:bg-forest disabled:cursor-not-allowed disabled:opacity-50">
        {!enabled ? "Checkout opens soon" : busy ? "Opening secure payment…" : `Pay ${format(subtotal + rate.amount)}`}
      </button>
      <p role="alert" className="min-h-5 text-sm text-clay">{error}</p>
      {testMode && (
        <p className="border border-gold bg-paper p-2 text-xs">
          Test mode: no real payment is taken. Use card 4242 4242 4242 4242, any future date and any CVC.
        </p>
      )}
      <p className="text-xs text-muted">
        You pay on Stripe&apos;s secure page by card, Apple Pay or Google Pay. Prices are charged in pounds. Mobile money is coming soon.
      </p>
    </div>
  );
}
