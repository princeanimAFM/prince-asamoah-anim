import type { Metadata } from "next";
import { CartView } from "@/components/CartView";
import { checkoutStatus } from "@/lib/checkout-config";

export const metadata: Metadata = { title: "Your bag" };

// Read at request time, so turning checkout on in the host's settings needs no code change.
export const dynamic = "force-dynamic";

export default function CartPage() {
  const status = checkoutStatus();
  return (
    <div className="gutter mx-auto max-w-7xl">
      <h1 className="display py-10 text-5xl md:text-7xl">Your bag</h1>
      <CartView checkoutEnabled={status.ready} testMode={status.ready && status.testMode} />
    </div>
  );
}
