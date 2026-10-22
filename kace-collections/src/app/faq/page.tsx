import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/Prose";

export const metadata: Metadata = { title: "FAQ" };

// Policies marked [to confirm] need the owner's decision before the shop opens.
const FAQS: { group: string; items: [string, React.ReactNode][] }[] = [
  {
    group: "Orders and delivery",
    items: [
      ["Where do you deliver?", "To addresses in the United Kingdom and Ghana."],
      ["How long will my order take?", "Most pieces are bought from the designer when you order, then checked and sent to you. Allow 2 to 3 weeks. Items marked as in stock ship sooner. You'll get an email at every step."],
      ["How much is delivery?", "Delivery is worked out at checkout from your address and what you've ordered. [Delivery prices to confirm.]"],
      ["Can I track my order?", "Yes. We email you when your order is placed, when it leaves the designer, when it arrives with us, and when it's on its way to you, with a tracking number."],
    ],
  },
  {
    group: "Payment and prices",
    items: [
      ["How can I pay?", "By Visa, Mastercard or American Express, or with Apple Pay or Google Pay. Mobile money (MTN MoMo and others) is coming soon."],
      ["Which currency will I pay in?", "All orders are charged in British pounds (£). You can view prices in Ghana cedis (₵) as a guide; your bank converts the amount when you pay."],
      ["Is my payment secure?", "Yes. Payments are handled by Stripe, a regulated payment provider. Your card details never reach our website."],
    ],
  },
  {
    group: "Returns",
    items: [
      ["Can I return something?", "If you're in the UK you can cancel your order within 14 days of receiving it, for any reason, and get a full refund for the item. [Return postage and any made-to-measure exceptions to confirm.]"],
      ["What if something arrives damaged?", "Contact us within 48 hours with a photo and we'll put it right with a replacement or a refund."],
    ],
  },
  {
    group: "Products",
    items: [
      ["How do the sizes fit?", "Each designer cuts slightly differently, so check the details on each product. If you're unsure, contact us and we'll measure the piece for you."],
      ["Can you make something to my design?", <>Yes. Send us a picture or sketch, or pick a look from our Lookbook, and our designers in Ghana will make it to your measurements. <Link href="/custom" className="underline underline-offset-4">See how custom orders work</Link>.</>],
      ["A piece is sold out. Can I still get it?", "Often, yes. Many designers make to order. Contact us and we'll ask the maker. Back-in-stock alerts are coming soon."],
    ],
  },
];

export default function Faq() {
  return (
    <div className="gutter mx-auto max-w-7xl">
      <PageHeader title="FAQ" intro="Delivery, payment, returns and sizing." />
      <div className="grid gap-12 py-12 lg:grid-cols-[220px_1fr]">
        <nav aria-label="FAQ sections" className="hidden lg:block">
          <ul className="sticky top-32 space-y-2 text-sm font-semibold">
            {FAQS.map((g) => <li key={g.group}><a href={`#${anchor(g.group)}`} className="hover:underline">{g.group}</a></li>)}
          </ul>
        </nav>
        <div className="max-w-3xl space-y-12">
          {FAQS.map((g) => (
            <section key={g.group} id={anchor(g.group)} className="scroll-mt-32">
              <h2 className="display mb-4 text-3xl">{g.group}</h2>
              <div className="divide-y divide-line border-y border-line">
                {g.items.map(([q, a]) => (
                  <details key={q} className="group py-4">
                    <summary className="flex cursor-pointer list-none justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                      {q}<span aria-hidden="true" className="transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 text-muted">{a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
          <p>Still have a question? <Link href="/contact" className="font-semibold underline underline-offset-4">Contact us</Link>.</p>
        </div>
      </div>
    </div>
  );
}

function anchor(s: string) {
  return s.toLowerCase().replace(/[^a-z]+/g, "-");
}
