import { describe, expect, it } from "vitest";
import { formatPrice, parseRate } from "./currency";

describe("currency", () => {
  it("formats pounds", () => {
    expect(formatPrice(9500)).toBe("£95.00");
    expect(formatPrice(123456)).toBe("£1,234.56");
  });
  it("shows whole cedis using the rate", () => {
    expect(formatPrice(9500, "GHS", 15.2)).toMatch(/1,444$/);
  });
  it("falls back to pounds without a rate", () => {
    expect(formatPrice(9500, "GHS", null)).toBe("£95.00");
  });
  it("parses the rate safely", () => {
    expect(parseRate("15.2")).toBe(15.2);
    expect(parseRate("")).toBeNull();
    expect(parseRate("-3")).toBeNull();
    expect(parseRate("abc")).toBeNull();
    expect(parseRate(undefined)).toBeNull();
  });
});
