import { describe, expect, it } from "vitest";
import { accountLabel, isBusinessTx, isPersonalAccount, monzoToRow, pickAccount, ukDate } from "./monzo-map";

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

describe("personal account: business transactions only", () => {
  const keep = (t: Parameters<typeof monzoToRow>[0]) => isBusinessTx(t, monzoToRow(t)!, "RMR");
  it("keeps client payments quoting an invoice number", () => {
    expect(keep({ ...base, amount: 100000, description: "RMR-0002", counterparty: { name: "MIGHTY COURIER" } })).toBe(true);
    expect(keep({ ...base, amount: 100000, description: "rmr 2", counterparty: { name: "K MENSAH" } })).toBe(true);
  });
  it("keeps anything tagged #rmr or #business in the notes", () => {
    expect(keep({ ...base, merchant: { name: "Anthropic" }, notes: "Claude #rmr" })).toBe(true);
    expect(keep({ ...base, amount: 50000, description: "Thanks", counterparty: { name: "K MENSAH" }, notes: "#Business" })).toBe(true);
  });
  it("skips everyday spending and other money in", () => {
    expect(keep({ ...base, merchant: { name: "Tesco" } })).toBe(false);
    expect(keep({ ...base, amount: 240000, description: "NHS SALARY", counterparty: { name: "NHS LOTHIAN" } })).toBe(false);
    expect(keep({ ...base, amount: -100000, description: "RMR-0002 refund", counterparty: { name: "X" } })).toBe(false);
  });
  it("knows personal account types", () => {
    expect(isPersonalAccount("uk_retail")).toBe(true);
    expect(isPersonalAccount("uk_retail_joint")).toBe(true);
    expect(isPersonalAccount("uk_business")).toBe(false);
    expect(isPersonalAccount(null)).toBe(false);
  });
});

describe("monzo: more mapping cases", () => {
  it("uses the UK date either side of the October clock change", () => {
    expect(ukDate("2026-10-24T23:30:00Z")).toBe("2026-10-25"); // BST
    expect(ukDate("2026-10-25T23:30:00Z")).toBe("2026-10-25"); // GMT
  });

  it("ignores an unexpanded merchant id and falls back to the counterparty or description", () => {
    expect(monzoToRow({ ...base, merchant: "merch_123", description: "TFL TRAVEL" })?.description).toBe("TFL TRAVEL");
    expect(monzoToRow({ ...base, merchant: null, counterparty: { name: "K MENSAH" }, description: "K MENSAH" })?.description).toBe(
      "K MENSAH",
    );
  });

  it("marks money back from a pot too", () => {
    const r = monzoToRow({ ...base, amount: 20_000, description: "pot_1", metadata: { pot_id: "pot_1" }, category: "savings" });
    expect(r).toMatchObject({ description: "Pot transfer", amount: 20_000, category: "savings pot" });
  });

  it("keeps descriptions to 300 characters", () => {
    expect(monzoToRow({ ...base, description: "x".repeat(400) })?.description).toHaveLength(300);
  });

  it("finds no account when all are closed or prepaid", () => {
    expect(pickAccount([])).toBeNull();
    expect(
      pickAccount([
        { id: "a", type: "uk_business", description: "", closed: true },
        { id: "b", type: "uk_prepaid", description: "", closed: false },
      ]),
    ).toBeNull();
    expect(pickAccount([{ id: "j", type: "uk_retail_joint", description: "acc_1", closed: false }])?.id).toBe("j");
    expect(accountLabel({ id: "j", type: "uk_retail_joint", description: "acc_1", closed: false })).toBe("Joint account");
  });
});

describe("personal account: edge cases", () => {
  const keep = (t: Parameters<typeof monzoToRow>[0], prefix = "RMR") => isBusinessTx(t, monzoToRow(t)!, prefix);
  it("finds the invoice number in the notes as well as the reference", () => {
    expect(keep({ ...base, amount: 50_000, description: "Payment", counterparty: { name: "K" }, notes: "for RMR-0004" })).toBe(true);
  });
  it("only accepts the tags as whole words", () => {
    expect(keep({ ...base, notes: "#rmrx" })).toBe(false);
    expect(keep({ ...base, notes: "#businesslunch" })).toBe(false);
    expect(keep({ ...base, notes: "rmr" })).toBe(false);
    expect(keep({ ...base, notes: "lunch #RMR." })).toBe(true);
  });
  it("uses the invoice prefix from settings", () => {
    const t = { ...base, amount: 50_000, description: "INV-0007", counterparty: { name: "K" } };
    expect(keep(t, "INV")).toBe(true);
    expect(keep(t, "RMR")).toBe(false);
  });
  it("skips untagged pot moves on a personal account", () => {
    expect(keep({ ...base, description: "pot_1", metadata: { pot_id: "pot_1" } })).toBe(false);
  });
});
