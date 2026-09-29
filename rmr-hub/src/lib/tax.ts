/**
 * UK self-employment tax estimate for a sole trader who also has a PAYE salary.
 *
 * Rates are for England, Wales and Northern Ireland. Scotland has different income
 * tax bands and is not modelled here. All amounts are in pence.
 *
 * This is a planning estimate, not tax advice: it ignores pension contributions,
 * student loans, other income, reliefs and the salary tax already collected by PAYE
 * being wrong. The number that counts is the one on the Self Assessment return.
 */

export interface TaxRates {
  label: string;
  personalAllowance: number;
  /** Income above this reduces the personal allowance by £1 for every £2. */
  allowanceTaperStart: number;
  basicBand: number;
  /** Taxable income above this is charged at the additional rate. */
  additionalThreshold: number;
  basicRate: number;
  higherRate: number;
  additionalRate: number;
  class4LowerLimit: number;
  class4UpperLimit: number;
  class4MainRate: number;
  class4UpperRate: number;
  tradingAllowance: number;
}

const p = (pounds: number) => Math.round(pounds * 100);

export const RATES: Record<string, TaxRates> = {
  "2025-26": {
    label: "2025-26",
    personalAllowance: p(12_570),
    allowanceTaperStart: p(100_000),
    basicBand: p(37_700),
    additionalThreshold: p(125_140),
    basicRate: 0.2,
    higherRate: 0.4,
    additionalRate: 0.45,
    class4LowerLimit: p(12_570),
    class4UpperLimit: p(50_270),
    class4MainRate: 0.06,
    class4UpperRate: 0.02,
    tradingAllowance: p(1_000),
  },
};
// Thresholds are frozen until April 2028, so later years reuse the same figures
// until they are confirmed. Update this table when HMRC publishes new rates.
RATES["2026-27"] = { ...RATES["2025-26"], label: "2026-27" };
RATES["2027-28"] = { ...RATES["2025-26"], label: "2027-28" };

export function ratesFor(taxYear: string): TaxRates {
  return RATES[taxYear] ?? RATES["2025-26"];
}

export function personalAllowance(totalIncome: number, r: TaxRates): number {
  const excess = Math.max(0, totalIncome - r.allowanceTaperStart);
  return Math.max(0, r.personalAllowance - Math.floor(excess / 2));
}

/** Income tax on a year's total income (salary + trading profit). */
export function incomeTax(totalIncome: number, r: TaxRates): number {
  const taxable = Math.max(0, totalIncome - personalAllowance(totalIncome, r));
  const basic = Math.min(taxable, r.basicBand);
  const higher = Math.max(0, Math.min(taxable, r.additionalThreshold) - r.basicBand);
  const additional = Math.max(0, taxable - r.additionalThreshold);
  return Math.round(basic * r.basicRate + higher * r.higherRate + additional * r.additionalRate);
}

/** Class 4 National Insurance on self-employed profit (salary does not count). */
export function class4(profit: number, r: TaxRates): number {
  const main = Math.max(0, Math.min(profit, r.class4UpperLimit) - r.class4LowerLimit);
  const upper = Math.max(0, profit - r.class4UpperLimit);
  return Math.round(main * r.class4MainRate + upper * r.class4UpperRate);
}

export interface TaxInput {
  taxYear: string;
  salary: number;
  income: number;
  expenses: number;
}

export interface TaxEstimate {
  rates: TaxRates;
  income: number;
  /** Expenses claimed, or the trading allowance if that is higher. */
  deduction: number;
  usesTradingAllowance: boolean;
  /** Income at or below £1,000: nothing to declare. */
  coveredByTradingAllowance: boolean;
  profit: number;
  extraIncomeTax: number;
  class4: number;
  total: number;
  /** Share of each £ of income to put aside for tax (0 to 1). */
  setAsideRate: number;
  marginalRate: number;
}

export function estimate({ taxYear, salary, income, expenses }: TaxInput): TaxEstimate {
  const r = ratesFor(taxYear);
  const coveredByTradingAllowance = income <= r.tradingAllowance;
  const usesTradingAllowance = r.tradingAllowance > expenses;
  const deduction = coveredByTradingAllowance ? income : Math.max(expenses, r.tradingAllowance);
  const profit = Math.max(0, income - deduction);
  const extraIncomeTax = incomeTax(salary + profit, r) - incomeTax(salary, r);
  const nic = class4(profit, r);
  const total = extraIncomeTax + nic;

  // Tax on the next £100 of profit, to suggest how much of new income to save.
  const step = 10_000;
  const next =
    incomeTax(salary + profit + step, r) - incomeTax(salary + profit, r) +
    class4(profit + step, r) - class4(profit, r);
  const marginalRate = next / step;

  return {
    rates: r,
    income,
    deduction,
    usesTradingAllowance,
    coveredByTradingAllowance,
    profit,
    extraIncomeTax,
    class4: nic,
    total,
    setAsideRate: income > 0 ? Math.max(total / income, marginalRate) : marginalRate,
    marginalRate,
  };
}
