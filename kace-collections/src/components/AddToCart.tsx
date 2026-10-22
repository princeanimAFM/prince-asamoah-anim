"use client";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/catalogue";
import { useShop } from "./ShopProvider";

export function AddToCart({ product }: { product: Product }) {
  const { dispatch, lines } = useShop();
  const available = product.sizes.filter((s) => s.stock > 0);
  const single = product.sizes.length === 1;
  const [size, setSize] = useState<string | null>(single && available.length ? product.sizes[0].label : null);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  if (!available.length) {
    return (
      <div className="space-y-3 border border-line p-5">
        <p className="font-semibold">Sold out</p>
        <p className="text-sm text-muted">
          This piece is sold out for now. Back-in-stock alerts are coming soon. Until then,{" "}
          <Link href="/contact" className="underline underline-offset-4">contact us</Link> and we&apos;ll ask the designer.
        </p>
      </div>
    );
  }

  const inBag = size ? lines.find((l) => l.slug === product.slug && l.size === size)?.qty ?? 0 : 0;
  const stock = product.sizes.find((s) => s.label === size)?.stock ?? 0;

  function add() {
    if (!size) { setError("Choose a size first."); return; }
    if (inBag >= stock) { setError(`Only ${stock} left in this size, and they're all in your bag.`); return; }
    dispatch({ type: "add", slug: product.slug, size });
    setError("");
    setAdded(true);
  }

  return (
    <div className="space-y-5">
      {!single && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Size{size && <span className="font-normal text-muted">: {size}</span>}</legend>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => {
              const out = s.stock === 0;
              return (
                <button key={s.label} type="button" disabled={out} aria-pressed={size === s.label}
                  onClick={() => { setSize(s.label); setError(""); setAdded(false); }}
                  className={`min-w-14 border px-3 py-2 text-sm font-semibold ${
                    size === s.label ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"
                  } ${out ? "cursor-not-allowed text-muted line-through opacity-50" : ""}`}>
                  {s.label}
                  {out && <span className="sr-only"> (sold out)</span>}
                </button>
              );
            })}
          </div>
          {size && stock > 0 && stock <= 2 && <p className="mt-2 text-sm text-clay">Only {stock} left in {size}</p>}
        </fieldset>
      )}
      <button type="button" onClick={add} className="w-full bg-ink px-6 py-4 font-semibold text-paper hover:bg-forest">
        Add to bag
      </button>
      <p role="status" className="min-h-6 text-sm">
        {error && <span className="text-clay">{error}</span>}
        {added && !error && (
          <span>Added to your bag. <Link href="/cart" className="font-semibold underline underline-offset-4">View bag</Link></span>
        )}
      </p>
    </div>
  );
}
