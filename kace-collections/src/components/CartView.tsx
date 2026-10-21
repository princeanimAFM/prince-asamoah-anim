"use client";
import Link from "next/link";
import { priceCart, MAX_QTY_PER_LINE } from "@/lib/cart";
import { SITE } from "@/lib/site";
import { Price } from "./Price";
import { ProductImage } from "./ProductImage";
import { useShop } from "./ShopProvider";

export function CartView() {
  const { lines, dispatch, ready, format, currency } = useShop();
  const cart = priceCart(lines);

  if (!ready) return <p className="py-16 text-muted">Loading your bag…</p>;

  if (!cart.lines.length) {
    return (
      <div className="bg-sand px-6 py-16 text-center">
        <p className="display text-3xl">Your bag is empty</p>
        <p className="mt-2 text-muted">Find something you love from Ghana&apos;s designers.</p>
        <Link href="/new-arrivals" className="mt-6 inline-block bg-ink px-6 py-3 font-semibold text-paper">Shop new in</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <ul className="divide-y divide-line border-y border-line">
        {cart.lines.map(({ product, size, qty, lineTotal }) => {
          const stock = product.sizes.find((s) => s.label === size)?.stock ?? 0;
          const max = Math.min(stock, MAX_QTY_PER_LINE);
          return (
            <li key={`${product.slug}-${size}`} className="flex gap-4 py-5">
              <Link href={`/products/${product.slug}`} className="w-24 shrink-0 bg-sand sm:w-28">
                <ProductImage product={product} className="aspect-[3/4] w-full" sizes="112px" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/products/${product.slug}`} className="font-semibold hover:underline">{product.name}</Link>
                    <p className="text-sm text-muted">{product.sizes.length > 1 ? `Size ${size}` : size}</p>
                  </div>
                  <Price pence={lineTotal} className="font-semibold" />
                </div>
                <div className="mt-auto flex items-center gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <span className="text-muted">Qty</span>
                    <select id={`qty-${product.slug}-${size}`} value={qty} className="border border-line bg-paper px-2 py-1"
                      onChange={(e) => dispatch({ type: "setQty", slug: product.slug, size, qty: Number(e.target.value) })}>
                      {Array.from({ length: max }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </label>
                  <button type="button" className="underline underline-offset-4"
                    onClick={() => dispatch({ type: "remove", slug: product.slug, size })}>
                    Remove
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="h-fit space-y-4 bg-sand p-6">
        <h2 className="display text-2xl">Order summary</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt>Subtotal ({cart.count} {cart.count === 1 ? "item" : "items"})</dt><dd className="font-semibold tabular-nums">{format(cart.subtotal)}</dd></div>
          <div className="flex justify-between text-muted"><dt>Delivery</dt><dd>At checkout</dd></div>
        </dl>
        {currency === "GHS" && (
          <p className="text-xs text-muted">Cedi prices are a guide. You pay £{(cart.subtotal / 100).toFixed(2)} in pounds; your bank converts it.</p>
        )}
        <button type="button" disabled={SITE.preview} className="w-full bg-ink px-6 py-4 font-semibold text-paper disabled:cursor-not-allowed disabled:opacity-50">
          {SITE.preview ? "Checkout opens soon" : "Checkout"}
        </button>
        <p className="text-xs text-muted">Pay by Visa, Mastercard, Amex or Apple Pay. Mobile money coming soon.</p>
      </aside>
    </div>
  );
}
