"use client";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/catalogue";

// Made-to-order pieces aren't bought through the bag: the customer picks a size (or chooses to
// give measurements) and goes on to the custom order request, where the price is confirmed.
export function RequestMadeToOrder({ product }: { product: Product }) {
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0].label : null);
  const query = new URLSearchParams({ product: product.slug });
  if (size) query.set("size", size);

  return (
    <div className="space-y-5">
      <div className="space-y-1 border-l-4 border-forest bg-sand px-4 py-3 text-sm">
        <p className="font-semibold">Made to order{product.makingTime && <>, ready in about {product.makingTime}</>}</p>
        <p className="text-muted">Made for you by the designer after you order. Choose your size, or send your measurements for a custom fit.</p>
      </div>
      {product.sizes.length > 1 && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Size{size && <span className="font-normal text-muted">: {size}</span>}</legend>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button key={s.label} type="button" aria-pressed={size === s.label} onClick={() => setSize(size === s.label ? null : s.label)}
                className={`min-w-14 border px-3 py-2 text-sm font-semibold ${size === s.label ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"}`}>
                {s.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted">Not sure? Leave it, and send your measurements with your request.</p>
        </fieldset>
      )}
      <Link href={`/custom?${query}`} className="block w-full bg-ink px-6 py-4 text-center font-semibold text-paper hover:bg-forest">
        Request this piece
      </Link>
    </div>
  );
}
