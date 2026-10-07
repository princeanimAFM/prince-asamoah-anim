import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import * as schema from "@/db/schema";
import { resetTestDb, useTestDb } from "@/test/db";
import type { MonzoTx } from "./monzo-map";
import { syncMonzo } from "./monzo";

vi.mock("server-only", () => ({}));

let db: Awaited<ReturnType<typeof useTestDb>>;

beforeAll(async () => {
  db = await useTestDb();
});

const NOW = new Date("2026-10-07T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;

beforeEach(async () => {
  vi.useFakeTimers({ now: NOW, toFake: ["Date"] });
  await resetTestDb(db);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function connect(extra: Partial<typeof schema.monzoAccount.$inferInsert> = {}) {
  await db.insert(schema.monzoAccount).values({
    id: 1,
    accessToken: "access",
    refreshToken: "refresh",
    expiresAt: Math.floor(NOW.getTime() / 1000) + 3600,
    accountId: "acc_b",
    accountType: "uk_business",
    ...extra,
  });
}

const tx = (n: number, extra: Partial<MonzoTx> = {}): MonzoTx => ({
  id: `tx_${String(n).padStart(4, "0")}`,
  created: "2026-10-01T10:00:00Z",
  description: `Shop ${n}`,
  amount: -100 - n,
  currency: "GBP",
  ...extra,
});

/** A pretend Monzo API. `pages` are served in turn to /transactions. */
function monzoApi(opts: { pages?: MonzoTx[][]; accounts?: unknown[]; status?: number } = {}) {
  const pages = [...(opts.pages ?? [[]])];
  const calls: { url: URL; auth: string | null; body?: string }[] = [];
  const fetch = vi.fn(async (input: string, init?: RequestInit) => {
    const url = new URL(input);
    calls.push({ url, auth: new Headers(init?.headers).get("authorization"), body: init?.body?.toString() });
    const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status });
    if (opts.status) return json({}, opts.status);
    if (url.pathname === "/oauth2/token") return json({ access_token: "new-access", refresh_token: "new-refresh", expires_in: 3600 });
    if (url.pathname === "/accounts") return json({ accounts: opts.accounts ?? [] });
    if (url.pathname === "/transactions") return json({ transactions: pages.shift() ?? [] });
    return json({}, 404);
  });
  vi.stubGlobal("fetch", fetch);
  return { calls, txCalls: () => calls.filter((c) => c.url.pathname === "/transactions") };
}

const account = async () => (await db.select().from(schema.monzoAccount))[0];
const imported = () => db.select().from(schema.transactions).orderBy(schema.transactions.externalId);

describe("syncMonzo paging", () => {
  it("follows pages of 100 using the last transaction id, and stops at a short page", async () => {
    await connect();
    const page1 = Array.from({ length: 100 }, (_, i) => tx(i + 1));
    const page2 = Array.from({ length: 100 }, (_, i) => tx(i + 101));
    const page3 = Array.from({ length: 7 }, (_, i) => tx(i + 201));
    const api = monzoApi({ pages: [page1, page2, page3, [tx(999)]] });

    expect(await syncMonzo()).toEqual({ added: 207, matched: 0 });
    const calls = api.txCalls();
    expect(calls).toHaveLength(3);
    expect(calls[0].url.searchParams.get("since")).toBe(new Date(NOW.getTime() - 89 * DAY).toISOString());
    expect(calls[1].url.searchParams.get("since")).toBe("tx_0100");
    expect(calls[2].url.searchParams.get("since")).toBe("tx_0200");
    for (const c of calls) {
      expect(c.auth).toBe("Bearer access");
      expect(c.url.searchParams.get("account_id")).toBe("acc_b");
      expect(c.url.searchParams.get("limit")).toBe("100");
      expect(c.url.searchParams.getAll("expand[]")).toEqual(["merchant"]);
    }
    expect(await imported()).toHaveLength(207);
    expect(await account()).toMatchObject({ lastSyncAt: NOW, lastError: null });
  });

  it("stops after 50 pages", async () => {
    await connect();
    const pages = Array.from({ length: 60 }, (_, p) => Array.from({ length: 100 }, (_, i) => tx(p * 100 + i)));
    const api = monzoApi({ pages });
    await syncMonzo();
    expect(api.txCalls()).toHaveLength(50);
  });

  it("re-reads the last 3 days after a previous sync, but never more than 89 days back", async () => {
    await connect({ lastSyncAt: new Date(NOW.getTime() - DAY) });
    let api = monzoApi();
    await syncMonzo();
    expect(api.txCalls()[0].url.searchParams.get("since")).toBe(new Date(NOW.getTime() - 4 * DAY).toISOString());

    await db.update(schema.monzoAccount).set({ lastSyncAt: new Date(NOW.getTime() - 200 * DAY) });
    api = monzoApi();
    await syncMonzo();
    expect(api.txCalls()[0].url.searchParams.get("since")).toBe(new Date(NOW.getTime() - 89 * DAY).toISOString());
  });

  it("doesn't add overlapping transactions twice", async () => {
    await connect();
    monzoApi({ pages: [[tx(1), tx(2)]] });
    await syncMonzo();
    monzoApi({ pages: [[tx(2), tx(3)]] });
    expect(await syncMonzo()).toEqual({ added: 1, matched: 0 });
    expect(await imported()).toHaveLength(3);
  });

  it("skips declined, zero and foreign-currency transactions", async () => {
    await connect();
    monzoApi({ pages: [[tx(1, { decline_reason: "INSUFFICIENT_FUNDS" }), tx(2, { amount: 0 }), tx(3, { currency: "EUR" }), tx(4)]] });
    expect(await syncMonzo()).toEqual({ added: 1, matched: 0 });
  });
});

describe("syncMonzo on a personal account", () => {
  it("imports only invoice payments and transactions tagged #rmr / #business", async () => {
    await connect({ accountId: "acc_p", accountType: "uk_retail" });
    const [client] = await db.insert(schema.clients).values({ name: "Kwame" }).returning();
    const [inv] = await db
      .insert(schema.invoices)
      .values({ number: "RMR-0002", clientId: client.id, issueDate: "2026-09-01", dueDate: "2026-09-15", status: "sent" })
      .returning();
    await db.insert(schema.invoiceItems).values({ invoiceId: inv.id, description: "Work", unitPrice: 100_000 });
    monzoApi({
      pages: [
        [
          tx(1, { merchant: { name: "Tesco" } }),
          tx(2, { amount: 240_000, description: "NHS SALARY", counterparty: { name: "NHS LOTHIAN" } }),
          tx(3, { amount: 100_000, description: "RMR-0002", counterparty: { name: "MIGHTY COURIER" } }),
          tx(4, { merchant: { name: "Anthropic" }, notes: "Claude #rmr" }),
          tx(5, { amount: -20_000, description: "pot_1", metadata: { pot_id: "pot_1" } }),
          tx(6, { amount: -20_000, description: "pot_1", metadata: { pot_id: "pot_1" }, notes: "tax #business" }),
        ],
      ],
    });
    expect(await syncMonzo()).toEqual({ added: 3, matched: 1 });
    expect((await imported()).map((t) => [t.externalId, t.kind])).toEqual([
      ["tx_0003", "income"],
      ["tx_0004", "expense"],
      ["tx_0006", "tax_saving"],
    ]);
  });

  it("imports everything from a business account", async () => {
    await connect();
    monzoApi({ pages: [[tx(1, { merchant: { name: "Tesco" } }), tx(2, { amount: 5_000, description: "Refund" })]] });
    expect(await syncMonzo()).toEqual({ added: 2, matched: 0 });
  });
});

describe("syncMonzo account and errors", () => {
  it("picks the business account on the first sync and remembers it", async () => {
    await connect({ accountId: null, accountType: null });
    monzoApi({
      accounts: [
        { id: "acc_p", type: "uk_retail", description: "user_1", closed: false },
        { id: "acc_b", type: "uk_business", description: "RMR Dev Works", closed: false },
      ],
    });
    await syncMonzo();
    expect(await account()).toMatchObject({ accountId: "acc_b", accountType: "uk_business", accountName: "Business account (RMR Dev Works)" });
  });

  it("fails clearly when there is no open account", async () => {
    await connect({ accountId: null, accountType: null });
    monzoApi({ accounts: [{ id: "acc_x", type: "uk_retail", description: "", closed: true }] });
    await expect(syncMonzo()).rejects.toThrow("No open Monzo account was found.");
    expect((await account()).lastError).toBe("No open Monzo account was found.");
  });

  it("refreshes an expired access token first", async () => {
    await connect({ expiresAt: Math.floor(NOW.getTime() / 1000) + 30 });
    const api = monzoApi();
    await syncMonzo();
    expect(api.calls[0].url.pathname).toBe("/oauth2/token");
    expect(api.calls[0].body).toContain("grant_type=refresh_token");
    expect(api.txCalls()[0].auth).toBe("Bearer new-access");
    expect(await account()).toMatchObject({ accessToken: "new-access", refreshToken: "new-refresh" });
  });

  it("records Monzo's refusal so Settings can show it, and imports nothing", async () => {
    await connect();
    monzoApi({ status: 403 });
    await expect(syncMonzo()).rejects.toThrow(/Approve access in the Monzo app/);
    expect((await account()).lastError).toMatch(/Approve access/);
    expect((await account()).lastSyncAt).toBeNull();
    expect(await imported()).toHaveLength(0);
  });

  it("asks to reconnect when not connected", async () => {
    monzoApi();
    await expect(syncMonzo()).rejects.toThrow("Monzo isn't connected.");
  });
});
