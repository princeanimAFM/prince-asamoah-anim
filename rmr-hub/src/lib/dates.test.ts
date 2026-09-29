import { describe, expect, it } from "vitest";
import { addDays, selfAssessmentDates, taxYearOf, taxYearRange, weekStart } from "./dates";

describe("tax years", () => {
  it("start on 6 April", () => {
    expect(taxYearOf("2026-04-05")).toBe("2025-26");
    expect(taxYearOf("2026-04-06")).toBe("2026-27");
    expect(taxYearOf("2026-01-15")).toBe("2025-26");
    expect(taxYearOf("2099-12-31")).toBe("2099-00");
  });
  it("have a range and deadlines", () => {
    expect(taxYearRange("2025-26")).toEqual({ start: "2025-04-06", end: "2026-04-05" });
    expect(selfAssessmentDates("2025-26")).toEqual({
      register: "2026-10-05",
      fileAndPay: "2027-01-31",
      secondPaymentOnAccount: "2027-07-31",
    });
  });
});

describe("weeks", () => {
  it("start on Monday", () => {
    expect(weekStart("2026-09-29")).toBe("2026-09-28");
    expect(weekStart("2026-09-28")).toBe("2026-09-28");
    expect(weekStart("2026-10-04")).toBe("2026-09-28");
  });
  it("add days across months", () => {
    expect(addDays("2026-09-28", 6)).toBe("2026-10-04");
  });
});
