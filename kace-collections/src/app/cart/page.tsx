import type { Metadata } from "next";
import { CartView } from "@/components/CartView";

export const metadata: Metadata = { title: "Your bag" };

export default function CartPage() {
  return (
    <div className="gutter mx-auto max-w-7xl">
      <h1 className="display py-10 text-5xl md:text-7xl">Your bag</h1>
      <CartView />
    </div>
  );
}
