import type { Metadata } from "next";
import { Suspense } from "react";
import { RequestSummary, StartOrderButton } from "@/components/CustomRequest";
import { PageHeader } from "@/components/Prose";

export const metadata: Metadata = {
  title: "Made for you",
  description: "Custom clothing made to your design and measurements by designers in Ghana.",
};

// Rules marked [to confirm] need the owner's decision before custom orders open.
const STEPS: [string, string][] = [
  ["Tell us what you want", "Pick a look from our Lookbook, or send a picture or sketch of your own idea. Tell us the fabric, colours, your size or measurements, and when you need it."],
  ["Get a quote", "We check it with our designers in Ghana and send you a price and a making time, usually within 2 working days. [to confirm]"],
  ["Pay a deposit", "Pay a deposit by card to start. Your piece is made to order, just for you. [Deposit amount to confirm]"],
  ["We make it", "Your designer gets to work. We send you a photo before it leaves the workshop."],
  ["Delivered to you", "Pay the balance, and we send it to you in the UK or Ghana with tracking."],
];

export default function Custom() {
  return (
    <div className="gutter mx-auto max-w-7xl">
      <PageHeader title="Made for you" intro="Your design, your measurements, made by hand in Ghana." />

      <Suspense>
        <RequestSummary />
      </Suspense>

      <ol className="grid gap-6 py-12 md:grid-cols-5">
        {STEPS.map(([title, text], i) => (
          <li key={title} className="space-y-2 border-t-4 border-ink pt-4">
            <p className="display text-4xl text-gold">{i + 1}</p>
            <h2 className="font-semibold">{title}</h2>
            <p className="text-sm text-muted">{text}</p>
          </li>
        ))}
      </ol>

      <section className="grid gap-8 bg-sand p-8 md:grid-cols-2 md:p-14">
        <div className="space-y-3">
          <h2 className="display text-4xl">Start your order</h2>
          <p className="text-muted">
            An online request form, where you can upload pictures and your measurements, is coming soon. For now, message us
            with your idea.
          </p>
          <Suspense>
            <StartOrderButton />
          </Suspense>
        </div>
        <div className="space-y-3 text-sm text-muted">
          <h3 className="font-semibold text-ink">Good to know</h3>
          <ul className="list-disc space-y-2 pl-5">
            <li>Made-to-order pieces are made just for you, so they can&apos;t be returned for a change of mind. If something is faulty or not what we agreed, we&apos;ll put it right.</li>
            <li>We can make a style similar to one you like, but we don&apos;t copy other brands&apos; designs, logos or labels.</li>
            <li>Send pictures you took yourself, or that you have the right to share.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
