/**
 * The payments agreed in a contract, read from section 2 ("Price and payment") of its wording,
 * so each one can be invoiced with the right amount and description.
 */
export interface ContractPayment {
  /** 1 for the first payment. */
  n: number;
  /** Number of payments agreed up front. */
  of: number;
  /** Pence. */
  amount: number;
  /** When it's due, in the contract's words, e.g. "before work starts". */
  when: string;
  /** e.g. "Payment 1 of 3 (before work starts)", or "Start fee (before work starts)". */
  label: string;
}

const MONEY = "£([\\d,]+\\.\\d{2})";
const pence = (s: string) => Math.round(Number(s.replace(/,/g, "")) * 100);

/** Text of section 2 only, so amounts elsewhere (fix rates, buy-out) are never picked up. */
function priceSection(body: string): string {
  const text = body.replace(/\r\n/g, "\n");
  const start = text.search(/^2\.\s+Price and payment\s*$/m);
  if (start < 0) return "";
  const rest = text.slice(start);
  const end = rest.slice(1).search(/^3\.\s+\S/m);
  return end < 0 ? rest : rest.slice(0, end + 1);
}

export function contractPayments(body: string): ContractPayment[] {
  const section = priceSection(body);
  if (!section) return [];

  // Staged payments: "- £250.00 before work starts"
  const staged = [...section.matchAll(new RegExp(`^-\\s+${MONEY}\\s+(.+?)\\s*$`, "gm"))].map((m) => ({
    amount: pence(m[1]),
    when: m[2],
  }));
  if (staged.length) {
    return staged.map((p, i) => ({
      n: i + 1,
      of: staged.length,
      amount: p.amount,
      when: p.when,
      label: `Payment ${i + 1} of ${staged.length} (${p.when})`,
    }));
  }

  // One payment: "The price is £500.00 for the work in section 1, paid before work starts."
  const single = section.match(new RegExp(`The price is ${MONEY} for the work in section 1, paid (before work starts)`));
  if (single) return [{ n: 1, of: 1, amount: pence(single[1]), when: single[2], label: `Full payment (${single[2]})` }];

  // Monthly plan: the start fee is invoiced here; monthly fees are invoiced as they fall due.
  const start = section.match(new RegExp(`The start fee is ${MONEY}, paid (before work starts)`));
  if (start) return [{ n: 1, of: 1, amount: pence(start[1]), when: start[2], label: `Start fee (${start[2]})` }];

  return [];
}

/** The project name, from a contract title such as "Software Development Agreement: KACE shop". */
export function projectName(title: string): string {
  return title.replace(/^Software Development Agreement:\s*/, "").trim() || title;
}
