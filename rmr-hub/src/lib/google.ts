import "server-only";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";

/**
 * Google Drive storage. Files are filed under one "RMR Dev Works" folder:
 *   RMR Dev Works/Invoices/2025-26/RMR-0001 - Client.pdf
 *   RMR Dev Works/Tax/2025-26/…
 * The app only has the `drive.file` scope, so it can see and change only what it created.
 */

const ROOT = "RMR Dev Works";
const FOLDER = "application/vnd.google-apps.folder";

export async function saveGoogleTokens(t: {
  email: string;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}) {
  const db = await getDb();
  const values = {
    email: t.email,
    accessToken: t.accessToken,
    expiresAt: t.expiresAt,
    updatedAt: new Date(),
    // Google only sends a refresh token on first consent; keep the old one otherwise.
    ...(t.refreshToken ? { refreshToken: t.refreshToken } : {}),
  };
  await db
    .insert(schema.googleAccount)
    .values({ id: 1, ...values })
    .onConflictDoUpdate({ target: schema.googleAccount.id, set: values });
}

export async function driveStatus(): Promise<{ connected: boolean; email?: string }> {
  const db = await getDb();
  const [acct] = await db.select().from(schema.googleAccount).limit(1);
  return acct?.refreshToken ? { connected: true, email: acct.email } : { connected: false };
}

async function accessToken(): Promise<string> {
  const db = await getDb();
  const [acct] = await db.select().from(schema.googleAccount).limit(1);
  if (!acct?.refreshToken) throw new Error("Google Drive isn't connected. Sign out and sign in again with Google.");
  const now = Math.floor(Date.now() / 1000);
  if (acct.accessToken && acct.expiresAt && acct.expiresAt - 60 > now) return acct.accessToken;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.AUTH_GOOGLE_ID ?? "",
      client_secret: process.env.AUTH_GOOGLE_SECRET ?? "",
      grant_type: "refresh_token",
      refresh_token: acct.refreshToken,
    }),
  });
  if (!res.ok) throw new Error("Google Drive access has expired. Sign out and sign in again with Google.");
  const data = (await res.json()) as { access_token: string; expires_in: number };
  await db
    .update(schema.googleAccount)
    .set({ accessToken: data.access_token, expiresAt: now + data.expires_in, updatedAt: new Date() })
    .where(eq(schema.googleAccount.id, 1));
  return data.access_token;
}

async function drive(token: string, url: string, init: RequestInit = {}) {
  const res = await fetch(url, { ...init, headers: { Authorization: `Bearer ${token}`, ...init.headers } });
  if (!res.ok) {
    const err = new Error(`Google Drive request failed (${res.status}): ${await res.text()}`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.json() as Promise<{ id: string; webViewLink?: string; trashed?: boolean }>;
}

async function createFolder(token: string, name: string, parent?: string): Promise<string> {
  const body = { name, mimeType: FOLDER, ...(parent ? { parents: [parent] } : {}) };
  const f = await drive(token, "https://www.googleapis.com/drive/v3/files?fields=id", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return f.id;
}

async function folderExists(token: string, id: string): Promise<boolean> {
  try {
    const f = await drive(token, `https://www.googleapis.com/drive/v3/files/${id}?fields=id,trashed`);
    return !f.trashed;
  } catch {
    return false;
  }
}

/** Folder id for a path like "Invoices/2025-26", creating folders as needed. */
async function ensureFolder(token: string, relPath: string): Promise<string> {
  const db = await getDb();
  const parts = [ROOT, ...relPath.split("/").filter(Boolean)];
  let parent: string | undefined;
  for (let i = 0; i < parts.length; i++) {
    const key = parts.slice(0, i + 1).join("/");
    const [cached] = await db.select().from(schema.driveFolders).where(eq(schema.driveFolders.path, key));
    let id: string | undefined = cached?.folderId;
    if (id && !(await folderExists(token, id))) {
      await db.delete(schema.driveFolders).where(eq(schema.driveFolders.path, key));
      id = undefined;
    }
    if (!id) {
      id = await createFolder(token, parts[i], parent);
      await db.insert(schema.driveFolders).values({ path: key, folderId: id }).onConflictDoUpdate({
        target: schema.driveFolders.path,
        set: { folderId: id },
      });
    }
    parent = id;
  }
  return parent!;
}

/**
 * Save a file to Drive. With `existingId` the file's contents are replaced (same link);
 * otherwise a new file is created in `folder`. Returns the Drive file id and link.
 */
export async function saveToDrive(opts: {
  folder: string;
  name: string;
  mimeType: string;
  data: Uint8Array;
  existingId?: string | null;
  /** Remember the file by folder + name, so saving again replaces it instead of adding a copy. */
  remember?: boolean;
}): Promise<{ id: string; link: string }> {
  if (opts.remember) {
    const db = await getDb();
    const key = `file:${opts.folder}/${opts.name}`;
    const [known] = await db.select().from(schema.driveFolders).where(eq(schema.driveFolders.path, key));
    const saved = await saveToDrive({ ...opts, remember: false, existingId: known?.folderId });
    await db
      .insert(schema.driveFolders)
      .values({ path: key, folderId: saved.id })
      .onConflictDoUpdate({ target: schema.driveFolders.path, set: { folderId: saved.id } });
    return saved;
  }

  const token = await accessToken();

  if (opts.existingId) {
    try {
      const f = await drive(
        token,
        `https://www.googleapis.com/upload/drive/v3/files/${opts.existingId}?uploadType=media&fields=id,webViewLink`,
        { method: "PATCH", headers: { "Content-Type": opts.mimeType }, body: Buffer.from(opts.data) },
      );
      return { id: f.id, link: f.webViewLink ?? `https://drive.google.com/file/d/${f.id}/view` };
    } catch (e) {
      if ((e as { status?: number }).status !== 404) throw e;
      // The file was deleted in Drive: fall through and create a new one.
    }
  }

  const parent = await ensureFolder(token, opts.folder);
  const boundary = `rmr${Date.now().toString(36)}`;
  const meta = JSON.stringify({ name: opts.name, parents: [parent] });
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: ${opts.mimeType}\r\n\r\n`),
    Buffer.from(opts.data),
    Buffer.from(`\r\n--${boundary}--`),
  ]);
  const f = await drive(
    token,
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
    { method: "POST", headers: { "Content-Type": `multipart/related; boundary=${boundary}` }, body },
  );
  return { id: f.id, link: f.webViewLink ?? `https://drive.google.com/file/d/${f.id}/view` };
}

export function driveLink(id: string) {
  return `https://drive.google.com/file/d/${id}/view`;
}
