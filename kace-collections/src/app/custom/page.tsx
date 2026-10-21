import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/Prose";
import { getLook } from "@/lib/lookbook";
import { SITE } from "@/lib/site";

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

export default async function Custom({ searchParams }: { searchParams: Promise<{ look?: string | string[] }> }) {
  const look = getLook((await searchParams).look);
  const wa = SITE.whatsapp.replace(/[^\d]/g, "");
  const message = look ? `Hi KACE, I'd like the "${look.title}" look from your Lookbook made for me.` : "Hi KACE, I'd like something made for me.";

  return (
    <div className="gutter mx-auto max-w-7xl">
      <PageHeader title="Made for you" intro="Your design, your measurements, made by hand in Ghana." />

      {look && (
        <div className="mt-8 flex items-center gap-4 border border-line p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={look.photos[0].src} alt="" className="h-24 w-16 object-cover" />
          <p>
            You&apos;re asking about <strong>{look.title}</strong>.{" "}
            <Link href={`/lookbook#${look.slug}`} className="underline underline-offset-4">See the look</Link>
          </p>
        </div>
      )}

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
          {wa ? (
            <a href={`https://wa.me/${wa}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer"
              className="inline-block bg-ink px-7 py-4 font-semibold text-paper hover:bg-forest">
              Message us on WhatsApp
            </a>
          ) : (
            <Link href="/contact" className="inline-block bg-ink px-7 py-4 font-semibold text-paper hover:bg-forest">Contact us</Link>
          )}
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
