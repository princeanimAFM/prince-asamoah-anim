/**
 * RMR Dev Works standard software development agreement, filled in from a form.
 * Plain text: numbered headings ("1. Title") on their own line, paragraphs separated by
 * a blank line, "- " bullets. The contract page and the PDF both render this format.
 *
 * This is a practical template, not legal advice. Review it before first use.
 */
import { formatDate } from "@/lib/dates";
import { formatGBP } from "@/lib/money";

export type PriceModel = "one_off" | "monthly";
export type Law = "scotland" | "england_wales";

export interface ContractInput {
  ownerName: string;
  businessName: string;
  ownerAddress: string;
  clientName: string;
  clientCompany: string;
  clientAddress: string;
  projectTitle: string;
  scope: string;
  model: PriceModel;
  /** One-off: total price. Monthly: setup fee. Pence. */
  price: number;
  monthly: number;
  minimumMonths: number;
  buyout: number;
  startDate: string;
  timeline: string;
  reviewRounds: number;
  warrantyDays: number;
  careMonthly: number;
  paymentTermsDays: number;
  law: Law;
}

const LAW: Record<Law, string> = {
  scotland: "Scotland, and the Scottish courts",
  england_wales: "England and Wales, and the courts of England and Wales",
};

function bullets(text: string): string {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim().replace(/^[-•*]\s*/, ""))
    .filter(Boolean)
    .map((l) => `- ${l}`)
    .join("\n");
}

export function buildContract(i: ContractInput): string {
  const client = i.clientCompany ? `${i.clientCompany} (contact: ${i.clientName})` : i.clientName;
  const price =
    i.model === "one_off"
      ? `The price is ${formatGBP(i.price)} for the work in section 1. It is paid in two parts: 50% (${formatGBP(
          Math.round(i.price / 2),
        )}) before work starts and the remaining ${formatGBP(i.price - Math.round(i.price / 2))} when the software is launched.`
      : `The setup fee is ${formatGBP(i.price)}, paid before work starts. From launch, the monthly fee is ${formatGBP(
          i.monthly,
        )} a month, for a minimum of ${i.minimumMonths} months. After the minimum period the agreement continues month to month until either of us ends it with 30 days' written notice.`;

  const support =
    i.model === "one_off"
      ? `For ${i.warrantyDays} days after launch we fix, free of charge, any fault where the software does not work as agreed. After that, ongoing care (hosting, updates and fixes) is available for ${formatGBP(
          i.careMonthly,
        )} a month if you want it.`
      : `The monthly fee covers hosting, security updates, fixing faults, support, and up to 2 hours of small changes each month. Unused hours do not carry over.`;

  const ownership =
    i.model === "one_off"
      ? `Once the full price has been paid, you own the software written for you under this agreement and may use and change it as you wish. Until then we grant you a licence to use it.`
      : `While you are on the monthly plan we keep ownership of the software and grant you a licence to use it for your business. After the minimum period you may buy the software outright for ${formatGBP(
          i.buyout,
        )}; ownership then passes to you and we hand over the code and accounts.`;

  return [
    `This agreement is between ${i.ownerName}, trading as ${i.businessName}${i.ownerAddress ? `, ${i.ownerAddress}` : ""} ("we", "us"), and ${client}${
      i.clientAddress ? `, ${i.clientAddress}` : ""
    } ("you"). It covers the project "${i.projectTitle}".`,

    `1. The work`,
    `We will design, build and set up the following:`,
    bullets(i.scope),
    `Anything not listed above is not included, and can be added as a change (section 4).`,

    `2. Price and payment`,
    price,
    `Invoices are payable within ${i.paymentTermsDays} days by bank transfer. We are not VAT registered, so no VAT is added. Costs charged by other providers (see section 8) are paid by you directly and are not part of our price. If a payment is more than 14 days late we may pause work until it is paid.`,

    `3. Timeline and what we need from you`,
    `Work starts on ${formatDate(i.startDate)}, or once the first payment is received if later. We expect to launch in ${i.timeline}. You will see working versions during the build.`,
    `To keep to this timeline you agree to give us the information, content, logins and feedback we ask for, normally within 5 working days. Delays on your side move the timeline by the same amount.`,

    `4. Changes`,
    `The price includes ${i.reviewRounds} rounds of changes during the build. Further changes, or new features after launch, are quoted in writing first and only done once you agree the price.`,

    `5. Launch, faults and support`,
    `We will show you the finished software before launch. It is accepted when you approve it, or when you start using it with real customers, whichever comes first.`,
    support,

    `6. Ownership`,
    ownership,
    `We may reuse our general know-how and tools (not your data or branding) in other work, and may mention you as a client and show the work in our portfolio unless you ask us not to.`,

    `7. Your data and confidentiality`,
    `Your business information and your customers' personal data remain yours. Where we handle personal data for you, we act as your data processor under UK GDPR: we only use it to provide the services, keep it secure, do not share it except with the service providers needed to run the software, tell you promptly about any data breach, and return or delete it when the agreement ends. You can export your data at any time.`,
    `Each of us keeps the other's confidential information private, during and after this agreement.`,

    `8. Other providers`,
    `The software relies on third-party services such as hosting, payments (for example Stripe), text messages and email. Accounts are set up in your business name where possible, and their charges are paid by you. We are not responsible for outages or changes made by those providers, but will help to resolve them.`,

    `9. Liability`,
    `We will do the work with reasonable skill and care. Our total liability under this agreement is limited to the amount you have paid us in the 12 months before the claim. Neither of us is liable for indirect losses such as loss of profit or business. Nothing in this agreement limits liability that cannot be limited by law.`,

    `10. Ending the agreement`,
    `Either of us may end this agreement by written notice if the other seriously breaks it and does not put it right within 14 days of being asked. You pay for work done up to the end date. ${
      i.model === "monthly"
        ? "If you end the monthly plan before the minimum period for any other reason, the remaining monthly fees for the minimum period are due."
        : "Deposits cover work already started and are not refundable once work has begun."
    } On ending, we give you an export of your data.`,

    `11. General`,
    `This is the whole agreement between us about the project, and changes to it must be in writing (email is fine). Signing electronically is as valid as signing on paper. This agreement is governed by the law of ${LAW[i.law]} have jurisdiction.`,
  ].join("\n\n");
}

export interface Block {
  kind: "heading" | "paragraph" | "bullet";
  text: string;
}

/** Split contract text into headings, paragraphs and bullets for display. */
export function parseContract(body: string): Block[] {
  const out: Block[] = [];
  for (const chunk of body.replace(/\r\n/g, "\n").split(/\n{2,}/)) {
    const lines = chunk.split("\n").filter((l) => l.trim() !== "");
    if (lines.length === 0) continue;
    if (lines.every((l) => /^\s*-\s+/.test(l))) {
      for (const l of lines) out.push({ kind: "bullet", text: l.replace(/^\s*-\s+/, "") });
    } else if (lines.length === 1 && /^\d{1,2}\.\s+\S/.test(lines[0]) && lines[0].length <= 80) {
      out.push({ kind: "heading", text: lines[0].trim() });
    } else {
      out.push({ kind: "paragraph", text: lines.join(" ") });
    }
  }
  return out;
}
