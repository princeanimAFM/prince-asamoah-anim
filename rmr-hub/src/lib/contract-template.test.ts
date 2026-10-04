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
  price: 300000,
  stages: 3,
  monthly: 0,
  termMonths: 24,
  minimumMonths: 12,
  buyoutPerMonth: 0,
  startDate: "2026-10-12",
  timeline: "5 to 6 weeks",
  reviewRounds: 2,
  warrantyDays: 30,
  careMonthly: 5000,
  smallFix: 15000,
  biggerChange: 30000,
  paymentTermsDays: 14,
  law: "scotland",
};

describe("buildContract", () => {
  it("fills in a one-off agreement", () => {
    const text = buildContract(base);
    expect(text).toContain("Mighty Courier Services (contact: Kwame Mensah)");
    expect(text).toContain("The price is £3,000.00");
    expect(text).toContain("- £1,000.00 when you are given the first working version to try");
    expect(text).toContain("care (hosting, security updates");
    expect(text).toContain("£150.00 for a small fix");
    expect(text).toContain("by no more than 5%");
    expect(text).toContain("law of Scotland");
    expect(text).toContain("- Labels with QR codes");
    expect(text).toContain("- Automatic payment reminders");
    expect(text).not.toContain("undefined");
  });

  it("splits two payments and puts odd pence on the last", () => {
    const text = buildContract({ ...base, price: 250001, stages: 2 });
    expect(text).toContain("- £1,250.00 before work starts");
    expect(text).toContain("- £1,250.01 when the software is launched");
  });

  it("fills in a monthly agreement with its term, minimum and buy-out", () => {
    const text = buildContract({ ...base, model: "monthly", price: 100000, monthly: 15500, buyoutPerMonth: 10500 });
    expect(text).toContain("start fee is £1,000.00");
    expect(text).toContain("£155.00 a month for 24 months");
    expect(text).toContain("minimum period is 12 months");
    expect(text).toContain("When all 24 monthly payments have been made, ownership passes to you");
    expect(text).toContain("£105.00 for each monthly payment still to come");
    expect(text).toContain("keep care for £50.00 a month");
  });
});

describe("parseContract", () => {
  it("splits headings, paragraphs and bullets", () => {
    const blocks = parseContract(buildContract(base));
    expect(blocks[0].kind).toBe("paragraph");
    expect(blocks.find((b) => b.kind === "heading")?.text).toBe("1. The work");
    expect(blocks.filter((b) => b.kind === "bullet").map((b) => b.text).slice(0, 3)).toEqual([
      "Online booking",
      "Labels with QR codes",
      "Automatic payment reminders",
    ]);
    expect(blocks.filter((b) => b.kind === "heading")).toHaveLength(11);
  });
});
