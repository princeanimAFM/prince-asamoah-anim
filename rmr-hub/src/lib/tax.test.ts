import { describe, expect, it } from "vitest";
import { estimate, incomeTax, class4, ratesFor } from "./tax";

const gbp =(n: number) => Math.round(n * 100);
const r = ratesFor("2025-26");

describe("incomeTax", () => {
  it("charges nothing up to the personal allowance", () => {
    expect(incomeTax(gbp(12_570), r)).toBe(0);
  });
  it("charges basic rate above the allowance", () => {
    expect(incomeTax(gbp(35_000), r)).toBe(gbp(4_486));
  });
  it("charges higher rate above £50,270", () => {
    expect(incomeTax(gbp(53_000), r)).toBe(gbp(8_632));
  });
  it("tapers the personal allowance above £100,000", () => {
    expect(incomeTax(gbp(120_000), r)).toBe(gbp(39_432));
  });
});

describe("Scottish income tax", () => {
  const s = ratesFor("2025-26", "scotland");
  it("uses the starter, basic and intermediate bands", () => {
    // 2,827 @19% + 12,094 @20% + 10,509 @21%
    expect(incomeTax(gbp(38_000), s)).toBe(gbp(5_162.82));
  });
  it("charges 42% above £43,662", () => {
    expect(incomeTax(gbp(48_000), s)).toBe(gbp(8_173.8));
  });
  it("adds side profit at Scottish rates, with the same Class 4 NI", () => {
    const e = estimate({ taxYear: "2025-26", region: "scotland", salary: gbp(38_000), income: gbp(11_000), expenses: gbp(500) });
    expect(e.profit).toBe(gbp(10_000));
    expect(e.extraIncomeTax).toBe(gbp(3_010.98));
    expect(e.class4).toBe(0);
    expect(e.marginalRate).toBeCloseTo(0.42, 5);
  });
  it("falls back to the latest rates for years not yet confirmed", () => {
    const later = ratesFor("2027-28", "scotland");
    expect(later.confirmed).toBe(false);
    expect(later.bands[0].rate).toBe(0.19);
  });
});

describe("class4", () => {
  it("is zero below the lower profits limit", () => {
    expect(class4(gbp(12_000), r)).toBe(0);
  });
  it("charges 6% between the limits", () => {
    expect(class4(gbp(18_500), r)).toBe(gbp(355.8));
  });
  it("charges 2% above the upper limit", () => {
    expect(class4(gbp(60_000), r)).toBe(gbp(37_700 * 0.06 + 9_730 * 0.02));
  });
});

describe("estimate", () => {
  it("needs nothing when income is within the £1,000 trading allowance", () => {
    const e = estimate({ taxYear: "2025-26", salary: gbp(35_000), income: gbp(900), expenses: 0 });
    expect(e.coveredByTradingAllowance).toBe(true);
    expect(e.total).toBe(0);
  });

  it("uses the trading allowance when expenses are lower", () => {
    const e = estimate({ taxYear: "2025-26", salary: gbp(35_000), income: gbp(5_000), expenses: gbp(400) });
    expect(e.usesTradingAllowance).toBe(true);
    expect(e.profit).toBe(gbp(4_000));
    expect(e.extraIncomeTax).toBe(gbp(800));
    expect(e.class4).toBe(0);
    expect(e.total).toBe(gbp(800));
  });

  it("taxes side profit that crosses into the higher rate band", () => {
    const e = estimate({ taxYear: "2025-26", salary: gbp(45_000), income: gbp(10_000), expenses: gbp(2_000) });
    expect(e.usesTradingAllowance).toBe(false);
    expect(e.profit).toBe(gbp(8_000));
    expect(e.extraIncomeTax).toBe(gbp(2_146));
    expect(e.marginalRate).toBeCloseTo(0.4, 5);
  });

  it("adds Class 4 NI once profit passes £12,570", () => {
    const e = estimate({ taxYear: "2025-26", salary: 0, income: gbp(20_000), expenses: gbp(1_500) });
    expect(e.profit).toBe(gbp(18_500));
    expect(e.extraIncomeTax).toBe(gbp(1_186));
    expect(e.class4).toBe(gbp(355.8));
    expect(e.total).toBe(gbp(1_541.8));
  });

  it("includes the allowance taper for high earners", () => {
    const e = estimate({ taxYear: "2025-26", salary: gbp(110_000), income: gbp(11_000), expenses: gbp(1_000) });
    expect(e.profit).toBe(gbp(10_000));
    expect(e.extraIncomeTax).toBe(gbp(6_000));
  });
});
