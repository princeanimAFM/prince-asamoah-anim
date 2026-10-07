import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { signingLinkOpen } from "@/lib/signing";

export function hashBody(body: string): string {
  return createHash("sha256").update(body, "utf8").digest("hex");
}

/** Unguessable signing-link token (192 bits). */
export function newToken(): string {
  return randomBytes(24).toString("base64url");
}

export function isToken(t: string): boolean {
  return /^[A-Za-z0-9_-]{32}$/.test(t);
}

export async function listContracts() {
  const db = await getDb();
  return db
    .select({ contract: schema.contracts, clientName: schema.clients.name, company: schema.clients.company })
    .from(schema.contracts)
    .innerJoin(schema.clients, eq(schema.contracts.clientId, schema.clients.id))
    .orderBy(desc(schema.contracts.createdAt));
}

export async function getContract(id: number) {
  const db = await getDb();
  const [row] = await db
    .select({ contract: schema.contracts, client: schema.clients })
    .from(schema.contracts)
    .innerJoin(schema.clients, eq(schema.contracts.clientId, schema.clients.id))
    .where(eq(schema.contracts.id, id));
  return row ?? null;
}

export async function getContractByToken(token: string) {
  if (!isToken(token)) return null;
  const db = await getDb();
  const [row] = await db
    .select({ contract: schema.contracts, client: schema.clients })
    .from(schema.contracts)
    .innerJoin(schema.clients, eq(schema.contracts.clientId, schema.clients.id))
    .where(eq(schema.contracts.token, token));
  if (!row || !signingLinkOpen(row.contract)) return null;
  return row;
}

/** This site's own address, for building signing links. */
export async function siteUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export function contractFileName(title: string, who: string) {
  return `${title} - ${who}.pdf`.replace(/[\\/:*?"<>|]/g, "").trim();
}
