import "server-only";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { importBankRows } from "@/lib/bank-import";
import { getSettings } from "@/lib/data";
import {
  type MonzoAccountInfo,
  type MonzoTx,
  accountLabel,
  isBusinessTx,
  isPersonalAccount,
  monzoToRow,
  pickAccount,
} from "@/lib/monzo-map";

/**
 * Read-only connection to your own Monzo account through Monzo's developer API
 * (https://docs.monzo.com). You create an OAuth client at developers.monzo.com, sign in
 * from Settings, then approve access in the Monzo app. Monzo then allows transactions from
 * the last 90 days to be read, which a daily sync keeps up with.
 */

const API = "https://api.monzo.com";

export function monzoConfigured(): boolean {
  return Boolean(process.env.MONZO_CLIENT_ID && process.env.MONZO_CLIENT_SECRET);
}

export function monzoAuthUrl(state: string, redirectUri: string): string {
  const q = new URLSearchParams({
    client_id: process.env.MONZO_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    state,
  });
  return `https://auth.monzo.com/?${q}`;
}

type TokenResponse = { access_token: string; refresh_token?: string; expires_in: number };

async function tokenRequest(params: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(`${API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.MONZO_CLIENT_ID ?? "",
      client_secret: process.env.MONZO_CLIENT_SECRET ?? "",
      ...params,
    }),
  });
  if (!res.ok) throw new Error(`Monzo sign-in failed (${res.status}). Please connect Monzo again.`);
  return (await res.json()) as TokenResponse;
}

async function saveTokens(t: TokenResponse, extra: Partial<typeof schema.monzoAccount.$inferInsert> = {}) {
  const db = await getDb();
  const values = {
    accessToken: t.access_token,
    expiresAt: Math.floor(Date.now() / 1000) + t.expires_in,
    ...(t.refresh_token ? { refreshToken: t.refresh_token } : {}),
    ...extra,
  };
  await db.insert(schema.monzoAccount).values({ id: 1, ...values }).onConflictDoUpdate({
    target: schema.monzoAccount.id,
    set: values,
  });
}

export async function finishMonzoConnect(code: string, redirectUri: string) {
  const t = await tokenRequest({ grant_type: "authorization_code", redirect_uri: redirectUri, code });
  await saveTokens(t, {
    connectedAt: new Date(),
    accountId: null,
    accountName: null,
    accountType: null,
    lastError: null,
    lastSyncAt: null,
  });
}

async function account() {
  const db = await getDb();
  const [a] = await db.select().from(schema.monzoAccount).limit(1);
  return a ?? null;
}

async function token(): Promise<string> {
  const a = await account();
  if (!a?.accessToken) throw new Error("Monzo isn't connected.");
  const now = Math.floor(Date.now() / 1000);
  if (a.expiresAt && a.expiresAt - 60 > now) return a.accessToken;
  if (!a.refreshToken) throw new Error("Monzo access has expired. Please connect Monzo again.");
  const t = await tokenRequest({ grant_type: "refresh_token", refresh_token: a.refreshToken });
  await saveTokens(t);
  return t.access_token;
}

class MonzoError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function api<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${await token()}` } });
  if (res.status === 403) {
    throw new MonzoError("Approve access in the Monzo app (you'll have a notification), then sync again.", 403);
  }
  if (res.status === 401) throw new MonzoError("Monzo access has expired. Please connect Monzo again.", 401);
  if (!res.ok) throw new MonzoError(`Monzo didn't respond properly (${res.status}). Please try again later.`, res.status);
  return (await res.json()) as T;
}

export async function monzoStatus() {
  const a = await account();
  return {
    configured: monzoConfigured(),
    connected: Boolean(a?.refreshToken || a?.accessToken),
    accountName: a?.accountName ?? null,
    personal: isPersonalAccount(a?.accountType),
    lastSyncAt: a?.lastSyncAt ?? null,
    lastError: a?.lastError ?? null,
  };
}

const DAY = 24 * 60 * 60 * 1000;

/** Fetch recent transactions from Monzo and add any new ones. */
export async function syncMonzo(): Promise<{ added: number; matched: number }> {
  const db = await getDb();
  try {
    let a = await account();
    if (!a) throw new Error("Monzo isn't connected.");
    if (!a.accountId || !a.accountType) {
      const { accounts } = await api<{ accounts: MonzoAccountInfo[] }>("/accounts");
      const chosen = accounts.find((x) => x.id === a!.accountId) ?? pickAccount(accounts);
      if (!chosen) throw new Error("No open Monzo account was found.");
      await db
        .update(schema.monzoAccount)
        .set({ accountId: chosen.id, accountName: accountLabel(chosen), accountType: chosen.type })
        .where(eq(schema.monzoAccount.id, 1));
      a = { ...a, accountId: chosen.id, accountType: chosen.type };
    }

    // Monzo only allows the last 90 days once the first 5 minutes after approval have passed.
    const earliest = Date.now() - 89 * DAY;
    const from = a.lastSyncAt ? Math.max(earliest, a.lastSyncAt.getTime() - 3 * DAY) : earliest;
    let since = new Date(from).toISOString();
    const all: MonzoTx[] = [];
    for (let page = 0; page < 50; page++) {
      const q = new URLSearchParams({ account_id: a.accountId!, since, limit: "100" });
      q.append("expand[]", "merchant");
      const { transactions } = await api<{ transactions: MonzoTx[] }>(`/transactions?${q}`);
      all.push(...transactions);
      if (transactions.length < 100) break;
      since = transactions[transactions.length - 1].id;
    }
    // On a personal account, keep only business transactions (see isBusinessTx).
    const personal = isPersonalAccount(a.accountType);
    const prefix = personal ? (await getSettings()).invoicePrefix : "";
    const rows = all.flatMap((t) => {
      const row = monzoToRow(t);
      if (!row) return [];
      return !personal || isBusinessTx(t, row, prefix) ? [row] : [];
    });
    const result = await importBankRows(rows, "monzo_api");
    await db
      .update(schema.monzoAccount)
      .set({ lastSyncAt: new Date(), lastError: null })
      .where(eq(schema.monzoAccount.id, 1));
    return result;
  } catch (e) {
    await db
      .update(schema.monzoAccount)
      .set({ lastError: (e as Error).message.slice(0, 300) })
      .where(eq(schema.monzoAccount.id, 1));
    throw e;
  }
}

export async function disconnectMonzo() {
  const a = await account();
  if (a?.accessToken) {
    // Best effort: also end the session on Monzo's side.
    await fetch(`${API}/oauth2/logout`, { method: "POST", headers: { Authorization: `Bearer ${a.accessToken}` } }).catch(
      () => undefined,
    );
  }
  const db = await getDb();
  await db.delete(schema.monzoAccount);
}
