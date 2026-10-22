import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy notice" };

// DRAFT for the owner to check. Update it whenever the shop collects new personal data, sends it
// to a new service, or keeps it for longer (see COMPLIANCE.md).
const who = SITE.ownerName ? `${SITE.ownerName}, trading as ${SITE.name}` : `${SITE.name} [owner's full name to add]`;

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy notice"
      updated="22 October 2026"
      intro={<p>This explains what personal information {SITE.name} collects when you shop with us, why, and your rights under UK data protection law (UK GDPR).</p>}
      sections={[
        { heading: "Who is responsible", body: <>
          <p>{who} is the data controller. Contact: {SITE.email || "[email to add]"}, {SITE.address || "[UK business address to add]"}.</p>
        </> },
        { heading: "What we collect and why", body: <>
          <ul>
            <li><strong>When you order:</strong> your name, email, phone number, delivery and billing address, and what you bought. We need these to take payment, deliver your order and keep you updated. The lawful basis is <em>contract</em>.</li>
            <li><strong>Payment:</strong> card details are entered on Stripe&apos;s page and handled by Stripe. We only see the last four digits and the card type.</li>
            <li><strong>Records:</strong> order and payment records, kept to meet tax law. The lawful basis is <em>legal obligation</em>.</li>
            <li><strong>When you contact us</strong> (for example by WhatsApp or email): your message and contact details, to reply to you.</li>
          </ul>
          <p>We don&apos;t sell your information, and we don&apos;t send marketing emails unless you&apos;ve asked for them.</p>
        </> },
        { heading: "Who we share it with", body: <>
          <ul>
            <li><strong>Stripe</strong> takes payments and sends your receipt (Stripe Payments Europe and Stripe, Inc., USA).</li>
            <li><strong>Netlify</strong> hosts this website (USA).</li>
            <li><strong>Our couriers</strong> get your name, address and phone number to deliver your order. [Courier names to add.] For orders to Ghana, these details go to our delivery partner in Ghana, because that&apos;s needed to deliver to you.</li>
          </ul>
          <p>Where your information leaves the UK, it&apos;s protected by the UK&apos;s approved safeguards (such as the UK International Data Transfer Agreement or the UK&ndash;US data bridge), or is sent because it&apos;s needed to fulfil your order.</p>
          <p>Our designers in Ghana don&apos;t receive your details: we order from them ourselves.</p>
        </> },
        { heading: "How long we keep it", body: <>
          <p>Order and payment records are kept for 6 years after the end of the tax year they relate to, as tax law requires. Messages are deleted when they&apos;re no longer needed, and within 2 years at most.</p>
        </> },
        { heading: "Cookies and your browser", body: <>
          <p>We don&apos;t use advertising or tracking cookies, or analytics. Your bag and your choice of currency are saved in your own browser so they&apos;re still there when you come back. They aren&apos;t sent to us. Stripe uses its own essential cookies on its payment page to prevent fraud.</p>
        </> },
        { heading: "Your rights", body: <>
          <p>You can ask for a copy of your information, ask us to correct it, delete it, or limit how we use it, and object to how we use it. Email us and we&apos;ll reply within one month.</p>
          <p>If you&apos;re unhappy with how we&apos;ve handled your information, you can complain to the Information Commissioner&apos;s Office at <a href="https://ico.org.uk/make-a-complaint/" className="underline underline-offset-4" rel="noopener noreferrer" target="_blank">ico.org.uk</a>. We&apos;d appreciate the chance to put it right first, so please <Link href="/contact" className="underline underline-offset-4">contact us</Link>.</p>
        </> },
      ]}
    />
  );
}
