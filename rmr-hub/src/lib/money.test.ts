import { describe, expect, it } from "vitest";
import { formatGBP, formatHours, parsePence, percent } from "./money";

describe("parsePence", () => {
  it("reads pounds in the ways people type them", () => {
    expect(parsePence("12")).toBe(1200);
    expect(parsePence("£1,234.50")).toBe(123_450);
    expect(parsePence(" 0.29 ")).toBe(29);
    expect(parsePence(".5")).toBe(50);
    expect(parsePence("-3.2")).toBe(-320);
    expect(parsePence("0")).toBe(0);
  });

  it("is exact for every two-decimal amount", () => {
    for (let pence = 0; pence <= 100_000; pence += 1) {
      const text = `${Math.floor(pence / 100)}.${String(pence % 100).padStart(2, "0")}`;
      if (parsePence(text) !== pence) throw new Error(`${text} -> ${parsePence(text)}`);
    }
  });

  it("rounds a fraction of a penny half away from zero, consistently", () => {
    // 1.005 * 100 is 100.49999… in floating point, which used to round down.
    expect(parsePence("1.005")).toBe(101);
    expect(parsePence("2.675")).toBe(268);
    expect(parsePence("1.125")).toBe(113);
    expect(parsePence("1.004")).toBe(100);
    expect(parsePence("-1.005")).toBe(-101);
    expect(parsePence("-0.005")).toBe(-1);
    expect(Object.is(parsePence("-0"), 0)).toBe(true);
  });

  it("refuses anything that isn't a plain amount", () => {
    for (const bad of [null, undefined, "", "  ", "£", "-", "abc", "1.2.3", "1e5", "12p", "Infinity", "0x10", "--1", "1-"]) {
      expect(parsePence(bad)).toBeNull();
    }
  });
});

describe("formatGBP", () => {
  it("formats pence as pounds with thousands separators", () => {
    expect(formatGBP(0)).toBe("£0.00");
    expect(formatGBP(1)).toBe("£0.01");
    expect(formatGBP(123_456_789)).toBe("£1,234,567.89");
  });
  it("puts the minus sign before the £", () => {
    expect(formatGBP(-1)).toBe("-£0.01");
    expect(formatGBP(-150_000)).toBe("-£1,500.00");
  });
  it("adds a + only when asked, and never to zero", () => {
    expect(formatGBP(2_500, { sign: true })).toBe("+£25.00");
    expect(formatGBP(0, { sign: true })).toBe("£0.00");
    expect(formatGBP(-2_500, { sign: true })).toBe("-£25.00");
  });
  it("round-trips with parsePence", () => {
    for (const p of [0, 1, 99, 100, 123_450, -42, 999_999_99]) expect(parsePence(formatGBP(p))).toBe(p);
  });
});

describe("formatHours and percent", () => {
  it("formats minutes", () => {
    expect(formatHours(0)).toBe("0m");
    expect(formatHours(45)).toBe("45m");
    expect(formatHours(120)).toBe("2h");
    expect(formatHours(150)).toBe("2h 30m");
  });
  it("formats a rate as a whole percentage", () => {
    expect(percent(0.2)).toBe("20%");
    expect(percent(0.425)).toBe("43%");
    expect(percent(0)).toBe("0%");
  });
});
