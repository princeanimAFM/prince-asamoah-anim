import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { DELIVERY } from "@/lib/delivery";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of sale" };

// DRAFT for the owner to check. Items in [square brackets] must be confirmed before the shop
// opens. Written for a UK sole trader selling to consumers (Consumer Rights Act 2015,
// Consumer Contracts Regulations 2013).
const who = SITE.ownerName ? `${SITE.ownerName}, trading as ${SITE.name}` : `${SITE.name} [owner's full name to add]`;

export default function Terms() {
  return (
    <LegalPage
      title="Terms of sale"
      updated="22 October 2026"
      intro={<p>These terms apply when you buy from {SITE.name}. Please read them before you order. They don&apos;t affect your legal rights as a consumer.</p>}
      sections={[
        { heading: "Who we are", body: <>
          <p>This shop is run by {who}. Address: {SITE.address || "[UK business address to add]"}. Email: {SITE.email || "[email to add]"}.</p>
        </> },
        { heading: "Your order", body: <>
          <p>When you pay, you make an offer to buy. We accept it, and the contract is made, when we email to confirm your order. If we can&apos;t supply a piece, for example because it has sold out, we&apos;ll tell you and refund you in full.</p>
          <p>Pieces are made by independent designers in Ghana, so colours and patchwork vary slightly from the photos. That is part of each piece&apos;s character and isn&apos;t a fault.</p>
        </> },
        { heading: "Prices and payment", body: <>
          <p>Prices are in pounds sterling and include any VAT that applies. [We are not VAT registered, so no VAT is charged.] Delivery is added at checkout.</p>
          <p>Payments are taken by Stripe. We never see or store your card details.</p>
        </> },
        { heading: "Delivery", body: <>
          <p>We deliver to the United Kingdom and Ghana:</p>
          <ul>
            {Object.values(DELIVERY).map((d) => (
              <li key={d.country}>{d.country}: £{(d.amount / 100).toFixed(2)}, usually {d.days[0]} to {d.days[1]} working days after dispatch.</li>
            ))}
          </ul>
          <p>In-stock pieces are usually dispatched within [3] working days. If your order hasn&apos;t arrived within 30 days, you can cancel it for a full refund.</p>
          <p><strong>Orders to Ghana:</strong> [import duty and taxes may be charged on arrival by the Ghana authorities and are paid by you to the courier.]</p>
        </> },
        { heading: "Changing your mind (14-day cancellation)", body: <>
          <p>If you live in the UK, you can cancel your order for any reason within 14 days of the day you receive it. Tell us by email at {SITE.email || "[email]"}, saying what you&apos;re returning. You don&apos;t need to give a reason.</p>
          <p>Send the pieces back within 14 days of telling us, unworn, with any tags. [You pay the cost of returning them.] We refund the price and the standard delivery cost within 14 days of receiving them back, to the card you paid with. We may reduce the refund if a piece has been worn or damaged beyond what was needed to try it on.</p>
          <p>Made-to-order pieces, made to your measurements or your design, can&apos;t be cancelled for a change of mind once making has started, because they&apos;re made just for you.</p>
        </> },
        { heading: "If something is wrong", body: <>
          <p>Everything we sell must be as described, of satisfactory quality and fit for purpose. If a piece is faulty or not as described, tell us within 30 days of receiving it for a full refund. After that, you&apos;re entitled to a repair or replacement, or in some cases a refund. This applies to made-to-order pieces too.</p>
          <p>Please email us a photo of any damage within 48 hours of delivery if you can, so we can sort it quickly.</p>
        </> },
        { heading: "Our responsibility to you", body: <>
          <p>We are responsible for loss or damage you suffer that is a foreseeable result of us breaking these terms. We don&apos;t exclude liability where it would be unlawful to do so.</p>
        </> },
        { heading: "Complaints and the law", body: <>
          <p>If you&apos;re unhappy, please <Link href="/contact" className="underline underline-offset-4">contact us</Link> first and we&apos;ll try to put it right. These terms are governed by the law of England and Wales. If you live in Scotland or Northern Ireland, you can also bring a claim in your local courts.</p>
          <p>How we use your details is explained in our <Link href="/privacy" className="underline underline-offset-4">privacy notice</Link>.</p>
        </> },
      ]}
    />
  );
}
