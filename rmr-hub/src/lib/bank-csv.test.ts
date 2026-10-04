import { describe, expect, it } from "vitest";
import { findInvoiceNumber, parseCSV, readBankCSV } from "./bank-csv";

const monzo = `Transaction ID,Date,Time,Type,Name,Emoji,Category,Amount,Currency,Local amount,Local currency,Notes and #tags,Address,Receipt,Description,Category split,Money Out,Money In
tx_0001,01/10/2026,09:12:00,Faster payment,Kwame Logistics,,Income,450.00,GBP,450.00,GBP,,,,"RMR-0007 deposit, thanks",,,450.00
tx_0002,02/10/2026,12:00:00,Card payment,Anthropic,,Bills,-18.00,GBP,-18.00,GBP,,,,ANTHROPIC CLAUDE,,-18.00,
tx_0003,03/10/2026,12:00:00,Pot transfer,Tax pot,,Savings,0.00,GBP,0.00,GBP,,,,,,,
`;

describe("parseCSV", () => {
  it("handles quotes, commas and escaped quotes", () => {
    expect(parseCSV('a,"b, c","say ""hi"""\n1,2,3')).toEqual([
      ["a", "b, c", 'say "hi"'],
      ["1", "2", "3"],
    ]);
  });
});

describe("readBankCSV", () => {
  it("reads a Monzo export", () => {
    const { rows, skipped } = readBankCSV(monzo);
    expect(skipped).toBe(1);
    expect(rows).toEqual([
      {
        externalId: "tx_0001",
        date: "2026-10-01",
        description: "Kwame Logistics · RMR-0007 deposit, thanks",
        amount: 45000,
        category: "Income",
      },
      {
        externalId: "tx_0002",
        date: "2026-10-02",
        description: "Anthropic · ANTHROPIC CLAUDE",
        amount: -1800,
        category: "Bills",
      },
    ]);
  });

  it("reads a generic money in / money out export and makes stable ids", () => {
    const csv = "Date,Description,Paid out,Paid in\n2026-10-01,Client A,,100.00\n2026-10-01,Client A,,100.00\n";
    const a = readBankCSV(csv).rows;
    const b = readBankCSV(csv).rows;
    expect(a.map((r) => r.amount)).toEqual([10000, 10000]);
    expect(a[0].externalId).not.toBe(a[1].externalId);
    expect(a.map((r) => r.externalId)).toEqual(b.map((r) => r.externalId));
  });

  it("explains a file it cannot read", () => {
    expect(() => readBankCSV("Foo,Bar\n1,2\n")).toThrow(/Date column/);
  });
});

describe("findInvoiceNumber", () => {
  it("finds references in different styles", () => {
    expect(findInvoiceNumber("Payment RMR-0007 thanks", "RMR")).toBe("RMR-0007");
    expect(findInvoiceNumber("rmr 12", "RMR")).toBe("RMR-0012");
    expect(findInvoiceNumber("no reference", "RMR")).toBeNull();
  });
});
