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
