"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth, skipAuth } from "@/auth";
import { getDb, schema } from "@/db";
import { getSettings } from "@/lib/data";
import { buildContract, type Law, type PriceModel } from "@/lib/contract-template";
import { renderContractPdf } from "@/lib/contract-pdf";
import { contractFileName, getContract, getContractByToken, hashBody, isToken, newToken } from "@/lib/contracts";
import { todayISO } from "@/lib/dates";
import { saveToDrive } from "@/lib/google";
import { parsePence } from "@/lib/money";

async function requireUser() {
  if (skipAuth) return;
  const session = await auth();
  if (!session?.user) redirect("/login");
}

const str = (f: FormData, k: string, max = 500) => String(f.get(k) ?? "").trim().slice(0, max);
const int = (f: FormData, k: string, fallback: number) => {
  const n = Math.round(Number(f.get(k)));
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

function refresh() {
  revalidatePath("/contracts", "layout");
}

export async function createContract(f: FormData) {
  await requireUser();
  const db = await getDb();
  const clientId = int(f, "clientId", 0);
  const [client] = await db.select().from(schema.clients).where(eq(schema.clients.id, clientId));
  if (!client) redirect("/contracts/new?error=client");
  const settings = await getSettings();
  const model: PriceModel = str(f, "model") === "monthly" ? "monthly" : "one_off";
  const law: Law = str(f, "law") === "england_wales" ? "england_wales" : "scotland";
  const projectTitle = str(f, "projectTitle", 120) || "Software development";
  const startDate = /^\d{4}-\d{2}-\d{2}$/.test(str(f, "startDate")) ? str(f, "startDate") : todayISO();
  const body = buildContract({
    ownerName: settings.ownerName,
    businessName: settings.businessName,
    ownerAddress: settings.address.replace(/\s*\n\s*/g, ", "),
    clientName: client.name,
    clientCompany: client.company,
    clientAddress: client.address.replace(/\s*\n\s*/g, ", "),
    projectTitle,
    scope: str(f, "scope", 4000) || "The software described in our proposal",
    model,
    price: parsePence(str(f, "price")) ?? 0,
    monthly: parsePence(str(f, "monthly")) ?? 0,
    minimumMonths: int(f, "minimumMonths", 12) || 12,
    buyout: parsePence(str(f, "buyout")) ?? 0,
    startDate,
    timeline: str(f, "timeline", 80) || "6 weeks",
    reviewRounds: int(f, "reviewRounds", 2),
    warrantyDays: int(f, "warrantyDays", 30),
    careMonthly: parsePence(str(f, "careMonthly")) ?? 0,
    paymentTermsDays: settings.paymentTermsDays,
    law,
  });
  const [row] = await db
    .insert(schema.contracts)
    .values({ clientId, title: `Software Development Agreement: ${projectTitle}`, body })
    .returning({ id: schema.contracts.id });
  refresh();
  redirect(`/contracts/${row.id}`);
}

export async function updateContractDraft(f: FormData) {
  await requireUser();
  const db = await getDb();
  const id = int(f, "id", 0);
  const title = str(f, "title", 160);
  const body = String(f.get("body") ?? "").slice(0, 60_000).trim();
  if (!title || !body) redirect(`/contracts/${id}?error=empty`);
  await db
    .update(schema.contracts)
    .set({ title, body })
    .where(and(eq(schema.contracts.id, id), eq(schema.contracts.status, "draft")));
  refresh();
  redirect(`/contracts/${id}?saved=1`);
}

/** Freeze the text and create the signing link. */
export async function sendContract(id: number) {
  await requireUser();
  const db = await getDb();
  const row = await getContract(id);
  if (!row || row.contract.status !== "draft") return;
  await db
    .update(schema.contracts)
    .set({ status: "sent", token: newToken(), bodyHash: hashBody(row.contract.body), sentAt: new Date() })
    .where(and(eq(schema.contracts.id, id), eq(schema.contracts.status, "draft")));
  refresh();
}

/** Withdraw an unsigned contract for editing: the old signing link stops working. */
export async function withdrawContract(id: number) {
  await requireUser();
  const db = await getDb();
  await db
    .update(schema.contracts)
    .set({ status: "draft", token: null, bodyHash: null, sentAt: null })
    .where(and(eq(schema.contracts.id, id), eq(schema.contracts.status, "sent")));
  refresh();
}

export async function voidContract(id: number) {
  await requireUser();
  const db = await getDb();
  await db.update(schema.contracts).set({ status: "void", token: null }).where(eq(schema.contracts.id, id));
  refresh();
}

export async function deleteDraftContract(id: number) {
  await requireUser();
  const db = await getDb();
  await db.delete(schema.contracts).where(and(eq(schema.contracts.id, id), eq(schema.contracts.status, "draft")));
  refresh();
  redirect("/contracts");
}

async function uploadSigned(id: number) {
  const row = await getContract(id);
  if (!row || row.contract.status !== "signed") throw new Error("Only signed contracts are saved to Drive");
  const settings = await getSettings();
  const pdf = await renderContractPdf({ settings, ...row });
  const who = row.client.company || row.client.name;
  const saved = await saveToDrive({
    folder: `Contracts/${who.replace(/[\\/]/g, "-")}`,
    name: contractFileName(row.contract.title, who),
    mimeType: "application/pdf",
    data: pdf,
    existingId: row.contract.driveFileId,
  });
  const db = await getDb();
  await db.update(schema.contracts).set({ driveFileId: saved.id }).where(eq(schema.contracts.id, id));
  return saved;
}

export async function saveContractToDrive(id: number): Promise<{ ok: boolean; message: string; link?: string }> {
  await requireUser();
  try {
    const saved = await uploadSigned(id);
    refresh();
    return { ok: true, message: "Saved to Google Drive", link: saved.link };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

// ------------------------------------------------------------------ public

const SIGNATURE = /^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/;

/**
 * Called from the public signing page. The secret token in the link is the only
 * credential, so everything is checked here: the token, that the contract is waiting
 * for a signature, that its text has not changed since it was sent, and the inputs.
 */
export async function signContract(f: FormData) {
  const token = str(f, "token", 64);
  if (!isToken(token)) redirect("/");
  const name = str(f, "name", 120);
  const consent = f.get("consent") === "on";
  const signature = String(f.get("signature") ?? "");
  if (name.length < 2 || !consent) redirect(`/sign/${token}?error=details`);
  if (signature && (signature.length > 400_000 || !SIGNATURE.test(signature))) redirect(`/sign/${token}?error=signature`);

  const row = await getContractByToken(token);
  if (!row || row.contract.status !== "sent") redirect(`/sign/${token}`);
  if (hashBody(row.contract.body) !== row.contract.bodyHash) redirect(`/sign/${token}?error=changed`);

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "";
  const db = await getDb();
  const updated = await db
    .update(schema.contracts)
    .set({
      status: "signed",
      signedAt: new Date(),
      signerName: name,
      signatureImage: signature || null,
      signerIp: ip.slice(0, 64),
      signerAgent: (h.get("user-agent") ?? "").slice(0, 300),
    })
    .where(and(eq(schema.contracts.token, token), eq(schema.contracts.status, "sent")))
    .returning({ id: schema.contracts.id });

  if (updated.length) {
    // Best effort: file the signed copy in Google Drive if it's connected.
    try {
      await uploadSigned(updated[0].id);
    } catch {
      /* Drive not connected or unavailable: the PDF can still be saved from the app. */
    }
  }
  refresh();
  redirect(`/sign/${token}?signed=1`);
}
