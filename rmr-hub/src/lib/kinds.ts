/** Transaction types, in the order they're offered. */
export const KINDS: Record<string, string> = {
  income: "Income",
  expense: "Business expense",
  tax_saving: "To tax pot",
  tax_payment: "Paid to HMRC",
  ignore: "Not business",
};
