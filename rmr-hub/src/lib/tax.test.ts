import { describe, expect, it } from "vitest";
import { class4, estimate, incomeTax, personalAllowance, ratesFor } from "./tax";

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

describe("Scottish and rest-of-UK bands side by side", () => {
  const s = ratesFor("2025-26", "scotland");
  it("charge the same on income within the personal allowance", () => {
    expect(incomeTax(gbp(12_570), s)).toBe(0);
    expect(incomeTax(gbp(12_570), r)).toBe(0);
    expect(incomeTax(gbp(12_571), s)).toBe(19);
    expect(incomeTax(gbp(12_571), r)).toBe(20);
  });
  it("cost Scottish taxpayers less at £25,000 and more at £60,000", () => {
    // Scotland: 2,827 @19% + 9,603 @20% = 2,457.73. Rest of UK: 12,430 @20% = 2,486.
    expect(incomeTax(gbp(25_000), s)).toBe(gbp(2_457.73));
    expect(incomeTax(gbp(25_000), r)).toBe(gbp(2_486));
    // Scotland: 2,827 @19% + 12,094 @20% + 16,171 @21% + 16,338 @42% = 13,213.80. Rest of UK: 7,540 + 9,730 @40% = 11,432.
    expect(incomeTax(gbp(60_000), s)).toBe(gbp(13_213.8));
    expect(incomeTax(gbp(60_000), r)).toBe(gbp(11_432));
  });
  it("use the advanced (45%) and top (48%) Scottish rates", () => {
    // Taxable 62,430 at £75,000; 1,000 more at 45%.
    const at75k = incomeTax(gbp(75_000), s);
    expect(incomeTax(gbp(76_000), s) - at75k).toBe(gbp(450));
    // Above £125,140 there is no allowance; each extra £1,000 is taxed at 48% (45% in the rest of the UK).
    expect(incomeTax(gbp(151_000), s) - incomeTax(gbp(150_000), s)).toBe(gbp(480));
    expect(incomeTax(gbp(151_000), r) - incomeTax(gbp(150_000), r)).toBe(gbp(450));
  });
  it("reads unknown regions as the rest of the UK", () => {
    expect(ratesFor("2025-26", "wales" as never).region).toBe("rest_of_uk");
  });
});

describe("personal allowance taper over £100,000", () => {
  it("keeps the full allowance up to £100,000", () => {
    expect(personalAllowance(gbp(100_000), r)).toBe(gbp(12_570));
  });
  it("loses £1 for every £2 over", () => {
    expect(personalAllowance(gbp(100_002), r)).toBe(gbp(12_569));
    expect(personalAllowance(gbp(100_001), r)).toBe(gbp(12_569.5));
    expect(personalAllowance(gbp(110_000), r)).toBe(gbp(7_570));
  });
  it("is gone at £125,140 and stays at zero", () => {
    expect(personalAllowance(gbp(125_140), r)).toBe(0);
    expect(personalAllowance(gbp(125_139), r)).toBe(gbp(0.5));
    expect(personalAllowance(gbp(500_000), r)).toBe(0);
  });
  it("taxes the band between £100,000 and £125,140 at an effective 60% (rest of UK)", () => {
    expect(incomeTax(gbp(101_000), r) - incomeTax(gbp(100_000), r)).toBe(gbp(600));
    // In Scotland the same band is 45% advanced rate plus the lost allowance: 67.5%.
    const s = ratesFor("2025-26", "scotland");
    expect(incomeTax(gbp(111_000), s) - incomeTax(gbp(110_000), s)).toBe(gbp(675));
  });
  it("is reflected in the set-aside rate for side profit in the taper", () => {
    const e = estimate({ taxYear: "2025-26", region: "rest_of_uk", salary: gbp(100_000), income: gbp(6_000), expenses: gbp(1_000) });
    expect(e.extraIncomeTax).toBe(gbp(3_000));
    expect(e.marginalRate).toBeCloseTo(0.6, 5);
    expect(e.setAsideRate).toBeCloseTo(0.6, 5);
  });
});

describe("Class 4 NI thresholds", () => {
  it("starts exactly at £12,570 and changes rate exactly at £50,270", () => {
    expect(class4(gbp(12_570), r)).toBe(0);
    expect(class4(gbp(12_571), r)).toBe(6);
    expect(class4(gbp(50_270), r)).toBe(gbp(2_262));
    expect(class4(gbp(50_271), r)).toBe(gbp(2_262.02));
  });
  it("is the same in Scotland", () => {
    const s = ratesFor("2025-26", "scotland");
    for (const profit of [0, gbp(12_571), gbp(30_000), gbp(80_000)]) expect(class4(profit, s)).toBe(class4(profit, r));
  });
  it("ignores salary: only self-employed profit counts", () => {
    const e = estimate({ taxYear: "2025-26", salary: gbp(60_000), income: gbp(5_000), expenses: gbp(1_000) });
    expect(e.class4).toBe(0);
  });
  it("is never negative", () => {
    expect(class4(0, r)).toBe(0);
    expect(class4(-gbp(5_000), r)).toBe(0);
  });
});

describe("no profit", () => {
  it("owes nothing when expenses equal income", () => {
    const e = estimate({ taxYear: "2025-26", salary: gbp(30_000), income: gbp(4_000), expenses: gbp(4_000) });
    expect(e.profit).toBe(0);
    expect(e.total).toBe(0);
    expect(e.usesTradingAllowance).toBe(false);
  });
  it("treats a loss as zero profit, without reducing tax on the salary", () => {
    const e = estimate({ taxYear: "2025-26", salary: gbp(30_000), income: gbp(3_000), expenses: gbp(8_000) });
    expect(e.profit).toBe(0);
    expect(e.extraIncomeTax).toBe(0);
    expect(e.class4).toBe(0);
    expect(e.total).toBe(0);
    // Nothing is owed yet, but the next £1 of profit is taxed at the salary's 20% band.
    expect(e.setAsideRate).toBeCloseTo(0.2, 5);
  });
  it("handles no income at all, and money out only (refunds)", () => {
    const none = estimate({ taxYear: "2025-26", salary: 0, income: 0, expenses: 0 });
    expect(none).toMatchObject({ profit: 0, total: 0, coveredByTradingAllowance: true, deduction: 0 });
    expect(none.setAsideRate).toBe(0);
    const negative = estimate({ taxYear: "2025-26", salary: 0, income: -gbp(500), expenses: gbp(100) });
    expect(negative).toMatchObject({ profit: 0, total: 0 });
  });
  it("covers income of exactly £1,000 with the trading allowance, but not £1,000.01", () => {
    expect(estimate({ taxYear: "2025-26", salary: gbp(20_000), income: gbp(1_000), expenses: 0 }).total).toBe(0);
    const over = estimate({ taxYear: "2025-26", salary: gbp(20_000), income: gbp(1_000.01), expenses: 0 });
    expect(over.coveredByTradingAllowance).toBe(false);
    expect(over.profit).toBe(1);
  });
});
