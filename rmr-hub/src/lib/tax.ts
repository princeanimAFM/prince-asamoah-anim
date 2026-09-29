/**
 * UK self-employment tax estimate for a sole trader who also has a PAYE salary.
 *
 * Income tax bands differ in Scotland; National Insurance is the same across the UK.
 * All amounts are in pence.
 *
 * This is a planning estimate, not tax advice: it ignores pension contributions,
 * student loans, other income and reliefs. The number that counts is the one on the
 * Self Assessment return.
 */

export type TaxRegion = "scotland" | "rest_of_uk";

export const REGIONS: Record<TaxRegion, string> = {
  scotland: "Scotland",
  rest_of_uk: "England, Wales or Northern Ireland",
};

export interface Band {
  /** Top of the band, measured in taxable income (after the personal allowance). */
  upTo: number;
  rate: number;
}

export interface TaxRates {
  label: string;
  region: TaxRegion;
  personalAllowance: number;
  /** Income above this reduces the personal allowance by £1 for every £2. */
  allowanceTaperStart: number;
  bands: Band[];
  class4LowerLimit: number;
  class4UpperLimit: number;
  class4MainRate: number;
  class4UpperRate: number;
  tradingAllowance: number;
}

const p = (pounds: number) => Math.round(pounds * 100);

const shared = {
  personalAllowance: p(12_570),
  allowanceTaperStart: p(100_000),
  class4LowerLimit: p(12_570),
  class4UpperLimit: p(50_270),
  class4MainRate: 0.06,
  class4UpperRate: 0.02,
  tradingAllowance: p(1_000),
};

const RATES: Record<TaxRegion, Record<string, TaxRates>> = {
  rest_of_uk: {
    "2025-26": {
      label: "2025-26",
      region: "rest_of_uk",
      ...shared,
      bands: [
        { upTo: p(37_700), rate: 0.2 },
        { upTo: p(125_140), rate: 0.4 },
        { upTo: Infinity, rate: 0.45 },
      ],
    },
  },
  scotland: {
    "2025-26": {
      label: "2025-26",
      region: "scotland",
      ...shared,
      bands: [
        { upTo: p(2_827), rate: 0.19 }, // starter
        { upTo: p(14_921), rate: 0.2 }, // basic
        { upTo: p(31_092), rate: 0.21 }, // intermediate
        { upTo: p(62_430), rate: 0.42 }, // higher
        { upTo: p(125_140), rate: 0.45 }, // advanced
        { upTo: Infinity, rate: 0.48 }, // top
      ],
    },
  },
};

// Later years reuse the latest confirmed figures until they are added here.
const LATEST = "2025-26";

export function ratesFor(taxYear: string, region: TaxRegion = "rest_of_uk"): TaxRates & { confirmed: boolean } {
  const table = RATES[region] ?? RATES.rest_of_uk;
  const r = table[taxYear];
  return r ? { ...r, confirmed: true } : { ...table[LATEST], label: taxYear, confirmed: false };
}

export function personalAllowance(totalIncome: number, r: TaxRates): number {
  const excess = Math.max(0, totalIncome - r.allowanceTaperStart);
  return Math.max(0, r.personalAllowance - Math.floor(excess / 2));
}

/** Income tax on a year's total income (salary + trading profit). */
export function incomeTax(totalIncome: number, r: TaxRates): number {
  const taxable = Math.max(0, totalIncome - personalAllowance(totalIncome, r));
  let tax = 0;
  let floor = 0;
  for (const band of r.bands) {
    if (taxable <= floor) break;
    tax += (Math.min(taxable, band.upTo) - floor) * band.rate;
    floor = band.upTo;
  }
  return Math.round(tax);
}

/** Class 4 National Insurance on self-employed profit (salary does not count). */
export function class4(profit: number, r: TaxRates): number {
  const main = Math.max(0, Math.min(profit, r.class4UpperLimit) - r.class4LowerLimit);
  const upper = Math.max(0, profit - r.class4UpperLimit);
  return Math.round(main * r.class4MainRate + upper * r.class4UpperRate);
}

export interface TaxInput {
  taxYear: string;
  region?: TaxRegion;
  salary: number;
  income: number;
  expenses: number;
}

export interface TaxEstimate {
  rates: TaxRates & { confirmed: boolean };
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

export function estimate({ taxYear, region = "rest_of_uk", salary, income, expenses }: TaxInput): TaxEstimate {
  const r = ratesFor(taxYear, region);
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
