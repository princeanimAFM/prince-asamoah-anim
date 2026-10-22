import { describe, expect, it } from "vitest";
import { buildContract, type ContractInput } from "./contract-template";
import { contractPayments, projectName } from "./contract-payments";

const base: ContractInput = {
  ownerName: "Prince Asamoah Anim", businessName: "RMR Dev Works", ownerAddress: "", clientName: "Adu", clientCompany: "Kace Collections",
  clientAddress: "", projectTitle: "KACE COLLECTIONS online shop", scope: "Online shop", model: "one_off", price: 50000, stages: 3,
  monthly: 0, termMonths: 24, minimumMonths: 12, buyoutPerMonth: 0, startDate: "2026-10-22", timeline: "2 to 4 weeks",
  reviewRounds: 2, warrantyDays: 30, careMonthly: 0, smallFix: 5000, biggerChange: 10000, paymentTermsDays: 14, law: "england_wales",
};

describe("contractPayments", () => {
  it("reads three staged payments, with odd pence on the last", () => {
    expect(contractPayments(buildContract(base))).toEqual([
      { n: 1, of: 3, amount: 16666, when: "before work starts", label: "Payment 1 of 3 (before work starts)" },
      { n: 2, of: 3, amount: 16666, when: "when you are given the first working version to try", label: "Payment 2 of 3 (when you are given the first working version to try)" },
      { n: 3, of: 3, amount: 16668, when: "when the software is launched", label: "Payment 3 of 3 (when the software is launched)" },
    ]);
  });
  it("adds up to the contract price", () => {
    for (const stages of [1, 2, 3]) {
      const total = contractPayments(buildContract({ ...base, stages, price: 123457 })).reduce((a, p) => a + p.amount, 0);
      expect(total).toBe(123457);
    }
  });
  it("reads a single payment and a monthly plan's start fee", () => {
    expect(contractPayments(buildContract({ ...base, stages: 1 }))).toEqual([
      { n: 1, of: 1, amount: 50000, when: "before work starts", label: "Full payment (before work starts)" },
    ]);
    const monthly = contractPayments(buildContract({ ...base, model: "monthly", price: 100000, monthly: 15500, careMonthly: 5000 }));
    expect(monthly).toEqual([{ n: 1, of: 1, amount: 100000, when: "before work starts", label: "Start fee (before work starts)" }]);
  });
  it("ignores amounts outside the price section, and wording it can't read", () => {
    const text = buildContract({ ...base, stages: 2 });
    expect(contractPayments(text).map((p) => p.amount)).toEqual([25000, 25000]);
    expect(contractPayments("A hand-written agreement with no price section.")).toEqual([]);
  });
  it("gets the project name from the title", () => {
    expect(projectName("Software Development Agreement: KACE COLLECTIONS online shop")).toBe("KACE COLLECTIONS online shop");
    expect(projectName("Website care")).toBe("Website care");
  });
});
