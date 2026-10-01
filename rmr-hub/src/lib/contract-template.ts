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
  /** One-off: total price. Monthly: start fee. Pence. */
  price: number;
  /** One-off: number of equal payments (2 or 3). */
  stages: number;
  /** Monthly: fee per month, including care. Pence. */
  monthly: number;
  /** Monthly: number of monthly payments after which the software is yours. */
  termMonths: number;
  minimumMonths: number;
  /** Monthly: early buy-out price for each monthly payment still to come. Pence. */
  buyoutPerMonth: number;
  startDate: string;
  timeline: string;
  reviewRounds: number;
  warrantyDays: number;
  careMonthly: number;
  /** Charges for fixes without the care plan. Pence. */
  smallFix: number;
  biggerChange: number;
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

/** Split a price into equal payments; any odd pence go on the last one. */
export function splitPayments(total: number, parts: number): number[] {
  const n = Math.max(1, Math.round(parts));
  const each = Math.floor(total / n);
  return Array.from({ length: n }, (_, k) => (k === n - 1 ? total - each * (n - 1) : each));
}

const STAGES: Record<number, string[]> = {
  1: ["before work starts"],
  2: ["before work starts", "when the software is launched"],
  3: ["before work starts", "when you are given the first working version to try", "when the software is launched"],
};

export function buildContract(i: ContractInput): string {
  const client = i.clientCompany ? `${i.clientCompany} (contact: ${i.clientName})` : i.clientName;
  const stages = Math.min(3, Math.max(1, Math.round(i.stages) || 2));
  const parts = splitPayments(i.price, stages);
  const equal = parts.every((p) => p === parts[0]);
  const care = `care (hosting, security updates, backups, fixing faults, and up to 1 hour of small changes each month; unused time does not carry over)`;
  const extraWork = `Without care, fixes and changes are charged at ${formatGBP(i.smallFix)} for a small fix (up to 2 hours) and ${formatGBP(
    i.biggerChange,
  )} for a bigger change (up to half a day). Anything larger is quoted first.`;

  const price =
    i.model === "one_off"
      ? stages === 1
        ? `The price is ${formatGBP(i.price)} for the work in section 1, paid before work starts.`
        : `The price is ${formatGBP(i.price)} for the work in section 1. It is paid in ${stages} ${
            equal ? "equal " : ""
          }payments:\n\n${parts.map((p, k) => `- ${formatGBP(p)} ${STAGES[stages][k]}`).join("\n")}`
      : `The start fee is ${formatGBP(i.price)}, paid before work starts. From launch, the monthly fee is ${formatGBP(
          i.monthly,
        )} a month for ${i.termMonths} months, which includes ${care}. The minimum period is ${i.minimumMonths} months. After the ${
          i.termMonths
        }th monthly payment the software is yours (section 6) and the monthly fee ends.`;

  const support =
    i.model === "one_off"
      ? `For ${i.warrantyDays} days after launch we fix, free of charge, any fault where the software does not work as agreed. After that you can choose ${care} for ${formatGBP(
          i.careMonthly,
        )} a month. ${extraWork}`
      : `The monthly fee includes ${care}. Once the software is yours, you can keep care for ${formatGBP(
          i.careMonthly,
        )} a month, or end it. ${extraWork}`;

  const priceReview = `Our prices are fixed for the first 24 months. After that we may increase the care fee once a year in line with inflation, by no more than 5%, with 60 days' written notice. If you do not accept an increase you may end care without charge.`;

  const ownership =
    i.model === "one_off"
      ? `Once the full price has been paid, you own the software written for you under this agreement and may use and change it as you wish. Until then we grant you a licence to use it. When it is yours we hand over the code and accounts, so you can stay with us or move to another developer.`
      : `While you are on the monthly plan we keep ownership of the software and grant you a licence to use it for your business. When all ${
          i.termMonths
        } monthly payments have been made, ownership passes to you. After the minimum period you may instead buy it early for ${formatGBP(
          i.buyoutPerMonth,
        )} for each monthly payment still to come; ownership then passes to you. When it is yours we hand over the code and accounts, so you can stay with us or move to another developer.`;

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
    priceReview,
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
        ? "If you end the monthly plan before the minimum period for any other reason, the remaining monthly fees for the minimum period are due. After the minimum period you may end it with 30 days' written notice; you then either buy the software early (section 6) or stop using it."
        : "Payments already made cover work started and are not refundable once work has begun."
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
