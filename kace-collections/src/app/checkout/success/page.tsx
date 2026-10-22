import type { Metadata } from "next";
import Link from "next/link";
import { ClearBag } from "@/components/ClearBag";
import { PageHeader } from "@/components/Prose";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };

export default function Success() {
  return (
    <div className="gutter mx-auto max-w-7xl">
      <ClearBag />
      <PageHeader title="Thank you" intro="Your order is in. A receipt is on its way to your email." />
      <div className="max-w-prose space-y-4 py-10 text-lg">
        <p>We&apos;ll check every piece and email you when your order is on its way, with tracking.</p>
        <p className="text-base text-muted">
          Questions about your order? <Link href="/contact" className="underline underline-offset-4">Contact us</Link> and
          include the email address you used.
        </p>
        <Link href="/shop" className="inline-block bg-ink px-7 py-4 text-base font-semibold text-paper hover:bg-forest">Keep shopping</Link>
      </div>
    </div>
  );
}
