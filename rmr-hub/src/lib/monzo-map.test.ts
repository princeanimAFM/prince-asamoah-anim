import { describe, expect, it } from "vitest";
import { accountLabel, monzoToRow, pickAccount, ukDate } from "./monzo-map";

const base = { id: "tx_1", created: "2026-03-31T23:30:00Z", description: "x", amount: -1500, currency: "GBP" };

describe("monzo", () => {
  it("uses the UK date (British Summer Time)", () => {
    expect(ukDate("2026-03-31T23:30:00Z")).toBe("2026-04-01");
    expect(ukDate("2026-01-10T23:30:00Z")).toBe("2026-01-10");
  });

  it("maps card spending to the merchant name", () => {
    const r = monzoToRow({ ...base, merchant: { name: "Anthropic" }, category: "general" });
    expect(r).toEqual({ externalId: "tx_1", date: "2026-04-01", description: "Anthropic", amount: -1500, category: "general" });
  });

  it("keeps the payment reference so invoices are matched", () => {
    const r = monzoToRow({ ...base, amount: 100000, description: "RMR-0003", counterparty: { name: "MIGHTY COURIER" } });
    expect(r?.description).toBe("MIGHTY COURIER · RMR-0003");
  });

  it("marks pot transfers so they count as tax savings", () => {
    const r = monzoToRow({ ...base, description: "pot_0000abc", metadata: { pot_id: "pot_0000abc" } });
    expect(r?.description).toBe("Pot transfer");
    expect(r?.category).toContain("pot");
  });

  it("skips declined, zero and foreign currency transactions", () => {
    expect(monzoToRow({ ...base, decline_reason: "INSUFFICIENT_FUNDS" })).toBeNull();
    expect(monzoToRow({ ...base, amount: 0 })).toBeNull();
    expect(monzoToRow({ ...base, currency: "EUR" })).toBeNull();
  });

  it("prefers the business account", () => {
    const accts = [
      { id: "acc_p", type: "uk_retail", description: "user_1", closed: false },
      { id: "acc_b", type: "uk_business", description: "RMR Dev Works", closed: false },
      { id: "acc_old", type: "uk_business", description: "Old", closed: true },
    ];
    expect(pickAccount(accts)?.id).toBe("acc_b");
    expect(pickAccount(accts.slice(0, 1))?.id).toBe("acc_p");
    expect(accountLabel(accts[1])).toBe("Business account (RMR Dev Works)");
    expect(accountLabel(accts[0])).toBe("Personal account");
  });
});
