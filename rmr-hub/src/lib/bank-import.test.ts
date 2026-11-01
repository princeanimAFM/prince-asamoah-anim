import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { resetTestDb, useTestDb } from "@/test/db";
import type { BankRow } from "./bank-csv";
import { guessKind, importBankRows } from "./bank-import";

vi.mock("server-only", () => ({}));

let db: Awaited<ReturnType<typeof useTestDb>>;

beforeAll(async () => {
  db = await useTestDb();
});

beforeEach(async () => {
  await resetTestDb(db);
});

/** A client with one invoice for £1,000 (or the lines given). */
async function invoice(number: string, opts: { status?: string; lines?: number[] } = {}) {
  const [client] = await db.insert(schema.clients).values({ name: "Kwame" }).returning();
  const [inv] = await db
    .insert(schema.invoices)
    .values({ number, clientId: client.id, issueDate: "2026-10-01", dueDate: "2026-10-15", status: opts.status ?? "sent" })
    .returning();
  for (const unitPrice of opts.lines ?? [100_000]) {
    await db.insert(schema.invoiceItems).values({ invoiceId: inv.id, description: "Work", unitPrice });
  }
  return inv;
}

const row = (externalId: string, amount: number, description: string, extra: Partial<BankRow> = {}): BankRow => ({
  externalId,
  date: "2026-10-05",
  description,
  amount,
  ...extra,
});

const getInvoice = async (id: number) => (await db.select().from(schema.invoices).where(eq(schema.invoices.id, id)))[0];
const allTx = () => db.select().from(schema.transactions).orderBy(schema.transactions.id);

describe("guessKind", () => {
  it("treats money moved to a pot as tax savings, and money back from a pot as ignored", () => {
    expect(guessKind(-50_000, "Pot transfer pot")).toBe("tax_saving");
    expect(guessKind(-50_000, "Tax Savings")).toBe("tax_saving");
    expect(guessKind(50_000, "Pot transfer pot")).toBe("ignore");
  });
  it("treats HMRC payments as tax payments", () => {
    expect(guessKind(-120_000, "HMRC SELF ASSESSMENT")).toBe("tax_payment");
    expect(guessKind(12_000, "HMRC refund")).toBe("income");
  });
  it("otherwise splits by sign", () => {
    expect(guessKind(100, "Kwame Logistics")).toBe("income");
    expect(guessKind(-100, "Anthropic")).toBe("expense");
  });
  it("doesn't mistake words containing 'pot' for a pot", () => {
    expect(guessKind(-999, "SPOTIFY")).toBe("expense");
    expect(guessKind(-999, "Potters Bar Parking")).toBe("expense");
  });
});

describe("importBankRows", () => {
  it("matches a payment quoting the invoice number and marks the invoice paid", async () => {
    const inv = await invoice("RMR-0007");
    const result = await importBankRows([row("tx_1", 100_000, "Kwame Logistics · rmr 7 thanks")], "csv");
    expect(result).toEqual({ added: 1, matched: 1 });
    const [tx] = await allTx();
    expect(tx).toMatchObject({ kind: "income", invoiceId: inv.id, source: "csv", externalId: "tx_1" });
    expect(await getInvoice(inv.id)).toMatchObject({ status: "paid", paidDate: "2026-10-05" });
  });

  it("links a part payment but keeps the invoice open until it is fully covered", async () => {
    const inv = await invoice("RMR-0001", { lines: [60_000, 40_000] });
    await importBankRows([row("tx_1", 40_000, "RMR-0001 deposit", { date: "2026-10-02" })], "csv");
    expect((await getInvoice(inv.id)).status).toBe("sent");
    const second = await importBankRows([row("tx_2", 60_000, "RMR-0001 balance", { date: "2026-10-09" })], "csv");
    expect(second).toEqual({ added: 1, matched: 1 });
    expect(await getInvoice(inv.id)).toMatchObject({ status: "paid", paidDate: "2026-10-09" });
  });

  it("marks an overpaid invoice paid", async () => {
    const inv = await invoice("RMR-0002");
    await importBankRows([row("tx_1", 100_001, "RMR-0002")], "csv");
    expect((await getInvoice(inv.id)).status).toBe("paid");
  });

  it("never marks a £0 invoice paid", async () => {
    const inv = await invoice("RMR-0003", { lines: [] });
    const result = await importBankRows([row("tx_1", 500, "RMR-0003")], "csv");
    expect(result.matched).toBe(1);
    expect((await getInvoice(inv.id)).status).toBe("sent");
  });

  it("doesn't match payments to void invoices or to numbers that don't exist", async () => {
    const inv = await invoice("RMR-0004", { status: "void" });
    const result = await importBankRows([row("tx_1", 100_000, "RMR-0004"), row("tx_2", 100_000, "RMR-0099")], "csv");
    expect(result).toEqual({ added: 2, matched: 0 });
    expect((await allTx()).every((t) => t.invoiceId === null)).toBe(true);
    expect((await getInvoice(inv.id)).status).toBe("void");
  });

  it("only matches money in: a refund quoting the number is an expense", async () => {
    const inv = await invoice("RMR-0005");
    const result = await importBankRows([row("tx_1", -100_000, "RMR-0005 refund")], "csv");
    expect(result.matched).toBe(0);
    expect((await allTx())[0]).toMatchObject({ kind: "expense", invoiceId: null });
    expect((await getInvoice(inv.id)).status).toBe("sent");
  });

  it("uses the invoice prefix from settings", async () => {
    await db.update(schema.settings).set({ invoicePrefix: "INV" }).where(eq(schema.settings.id, 1));
    try {
      const inv = await invoice("INV-0012");
      const result = await importBankRows([row("tx_1", 100_000, "inv12"), row("tx_2", 100_000, "RMR-0012")], "csv");
      expect(result.matched).toBe(1);
      expect((await getInvoice(inv.id)).status).toBe("paid");
    } finally {
      await db.update(schema.settings).set({ invoicePrefix: "RMR" }).where(eq(schema.settings.id, 1));
    }
  });

  it("skips transactions already imported, so a payment is never counted twice", async () => {
    const inv = await invoice("RMR-0006", { lines: [200_000] });
    const rows = [row("tx_1", 100_000, "RMR-0006 part 1"), row("tx_2", -1_800, "Anthropic")];
    expect(await importBankRows(rows, "csv")).toEqual({ added: 2, matched: 1 });
    // The same statement imported again, and the same payment twice in one file.
    expect(await importBankRows([...rows, rows[0]], "csv")).toEqual({ added: 0, matched: 0 });
    expect(await allTx()).toHaveLength(2);
    expect((await getInvoice(inv.id)).status).toBe("sent");
  });

  it("records pot moves as tax savings and HMRC payments as tax payments", async () => {
    await importBankRows(
      [
        row("tx_1", -30_000, "Pot transfer", { category: "savings pot" }),
        row("tx_2", 30_000, "Pot transfer", { category: "pot" }),
        row("tx_3", -150_000, "HMRC SA"),
      ],
      "monzo_api",
    );
    expect((await allTx()).map((t) => t.kind)).toEqual(["tax_saving", "ignore", "tax_payment"]);
  });

  it("does nothing with no rows", async () => {
    expect(await importBankRows([], "csv")).toEqual({ added: 0, matched: 0 });
  });
});
