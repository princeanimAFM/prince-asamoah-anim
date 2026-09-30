import { describe, expect, it } from "vitest";
import { buildContract, parseContract, type ContractInput } from "./contract-template";

const base: ContractInput = {
  ownerName: "Prince Asamoah Anim",
  businessName: "RMR Dev Works",
  ownerAddress: "",
  clientName: "Kwame Mensah",
  clientCompany: "Mighty Courier Services",
  clientAddress: "",
  projectTitle: "Parcel booking and payments app",
  scope: "Online booking\n- Labels with QR codes\n• Automatic payment reminders",
  model: "one_off",
  price: 220000,
  monthly: 0,
  minimumMonths: 12,
  buyout: 0,
  startDate: "2026-10-12",
  timeline: "5 to 6 weeks",
  reviewRounds: 2,
  warrantyDays: 30,
  careMonthly: 4500,
  paymentTermsDays: 14,
  law: "scotland",
};

describe("buildContract", () => {
  it("fills in a one-off agreement", () => {
    const text = buildContract(base);
    expect(text).toContain("Mighty Courier Services (contact: Kwame Mensah)");
    expect(text).toContain("£2,200.00");
    expect(text).toContain("50% (£1,100.00)");
    expect(text).toContain("law of Scotland");
    expect(text).toContain("- Labels with QR codes");
    expect(text).toContain("- Automatic payment reminders");
    expect(text).not.toContain("undefined");
  });

  it("fills in a monthly agreement with its minimum term and buy-out", () => {
    const text = buildContract({ ...base, model: "monthly", price: 80000, monthly: 11000, buyout: 120000 });
    expect(text).toContain("setup fee is £800.00");
    expect(text).toContain("£110.00 a month, for a minimum of 12 months");
    expect(text).toContain("buy the software outright for £1,200.00");
  });
});

describe("parseContract", () => {
  it("splits headings, paragraphs and bullets", () => {
    const blocks = parseContract(buildContract(base));
    expect(blocks[0].kind).toBe("paragraph");
    expect(blocks.find((b) => b.kind === "heading")?.text).toBe("1. The work");
    expect(blocks.filter((b) => b.kind === "bullet").map((b) => b.text)).toEqual([
      "Online booking",
      "Labels with QR codes",
      "Automatic payment reminders",
    ]);
    expect(blocks.filter((b) => b.kind === "heading")).toHaveLength(11);
  });
});
