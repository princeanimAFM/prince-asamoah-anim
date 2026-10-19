import type { Metadata } from "next";
import { PageHeader } from "@/components/Prose";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Contact" };

export default function Contact() {
  const wa = SITE.whatsapp.replace(/[^\d]/g, "");
  return (
    <div className="gutter mx-auto max-w-7xl">
      <PageHeader title="Contact us" intro="Questions about an order, sizing, or a piece you can't find? Get in touch." />
      <div className="grid gap-6 py-12 md:grid-cols-3">
        <ContactCard title="WhatsApp" note="Fastest reply, usually the same day.">
          {wa ? <a href={`https://wa.me/${wa}`} className="font-semibold underline underline-offset-4" rel="noopener noreferrer" target="_blank">{SITE.whatsapp}</a> : <Pending />}
        </ContactCard>
        <ContactCard title="Email" note="We reply within one working day.">
          {SITE.email ? <a href={`mailto:${SITE.email}`} className="font-semibold underline underline-offset-4">{SITE.email}</a> : <Pending />}
        </ContactCard>
        <ContactCard title="Business address" note="Not a shop: orders are online only.">
          {SITE.address ? <address className="not-italic">{SITE.ownerName && <>{SITE.ownerName}<br /></>}{SITE.address}</address> : <Pending />}
        </ContactCard>
      </div>
      <p className="max-w-prose text-muted">A contact form, and a form to request a piece we don&apos;t stock, are coming soon.</p>
    </div>
  );
}

function ContactCard({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 border border-line p-6">
      <h2 className="eyebrow">{title}</h2>
      <div className="text-lg">{children}</div>
      <p className="text-sm text-muted">{note}</p>
    </div>
  );
}

function Pending() {
  return <span className="text-muted">Coming soon</span>;
}
