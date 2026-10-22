import { formatDate } from "./dates";
import { bankLines, type BankDetails } from "./email";
import { formatGBP } from "./money";

/**
 * A phone number in the international form wa.me links need (digits only, country code first).
 * UK mobiles (07…) become 44…, and Ghanaian numbers (0 + 9 digits) become 233…. Returns "" if
 * there's no usable number.
 */
export function whatsAppNumber(phone: string): string {
  const digits = phone.replace(/^\s*\+/, "").replace(/\D/g, "").replace(/^00/, "");
  const intl = digits.replace(/^0(?=7\d{9}$)/, "44").replace(/^0(?=\d{9}$)/, "233");
  return /^[1-9]\d{7,14}$/.test(intl) ? intl : "";
}

export interface InvoiceMessageInput {
  number: string;
  amountDue: number;
  dueDate: string;
  clientName: string;
  ownerName: string;
  bank?: BankDetails;
}

/** Short WhatsApp message to go with the invoice PDF. */
export function invoiceWhatsApp(i: InvoiceMessageInput): string {
  const first = i.clientName.trim().split(/\s+/)[0] || "there";
  const bank = bankLines(i.bank, i.ownerName);
  const opening = `Hi ${first}, here's invoice ${i.number} for ${formatGBP(i.amountDue)}, due on ${formatDate(i.dueDate)}.`;
  const reference = `Please use ${i.number} as the payment reference.`;
  return bank.length
    ? `${opening}\n\nYou can pay by bank transfer to:\n${bank.join("\n")}\n\n${reference}\n\nThank you,\n${i.ownerName}`
    : `${opening} The payment details are on the PDF. ${reference} Thank you, ${i.ownerName}`;
}
