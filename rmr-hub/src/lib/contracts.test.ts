import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { resetTestDb, useTestDb } from "@/test/db";
import { contractFileName, getContractByToken, hashBody, isToken, newToken } from "./contracts";

vi.mock("server-only", () => ({}));

// The server actions run outside Next.js here: sign-in, redirects and request headers are stand-ins.
const signedIn = { value: true };
vi.mock("@/auth", () => ({ skipAuth: false, auth: vi.fn(async () => (signedIn.value ? { user: { email: "p@example.com" } } : null)) }));
class Redirect extends Error {}
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Redirect(url);
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: () => undefined }));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1", "user-agent": "Test browser" }),
}));
vi.mock("@/lib/contract-pdf", () => ({ renderContractPdf: vi.fn(async () => new Uint8Array([37, 80, 68, 70])) }));
vi.mock("@/lib/google", () => ({
  saveToDrive: vi.fn(async () => {
    throw new Error("Google Drive isn't connected.");
  }),
}));

const { sendContract, signContract, voidContract, withdrawContract } = await import("@/app/contract-actions");

let db: Awaited<ReturnType<typeof useTestDb>>;

beforeAll(async () => {
  db = await useTestDb();
});

beforeEach(async () => {
  signedIn.value = true;
  await resetTestDb(db);
});

async function draft(body = "1. Scope\nA parcel booking app.") {
  const [client] = await db.insert(schema.clients).values({ name: "Kwame" }).returning();
  const [c] = await db.insert(schema.contracts).values({ clientId: client.id, title: "Website", body }).returning();
  return c.id;
}

const load = async (id: number) => (await db.select().from(schema.contracts).where(eq(schema.contracts.id, id)))[0];

/** Submit the public signing form; returns where it redirects to. */
async function sign(token: string, fields: Record<string, string> = {}) {
  const f = new FormData();
  f.set("token", token);
  f.set("name", "Kwame Mensah");
  f.set("consent", "on");
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  try {
    await signContract(f);
  } catch (e) {
    if (e instanceof Redirect) return e.message;
    throw e;
  }
  throw new Error("signContract didn't redirect");
}

describe("text fingerprint", () => {
  it("is the SHA-256 of the UTF-8 text", () => {
    expect(hashBody("")).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    expect(hashBody("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
  it("changes with any edit, however small", () => {
    const body = "The fee is £3,000.";
    expect(hashBody(body)).toBe(hashBody(body));
    for (const edited of ["The fee is £3,001.", "The fee is £3,000. ", "the fee is £3,000.", "The fee is £3,000.\n", "The fee is\u00a0£3,000."]) {
      expect(hashBody(edited)).not.toBe(hashBody(body));
    }
  });
});

describe("signing tokens", () => {
  it("are 32 URL-safe characters and never repeat", () => {
    const tokens = new Set(Array.from({ length: 500 }, newToken));
    expect(tokens.size).toBe(500);
    for (const t of tokens) expect(isToken(t)).toBe(true);
  });
  it("rejects anything else before it reaches the database", () => {
    for (const t of ["", "a".repeat(31), "a".repeat(33), `${"a".repeat(31)}/`, `${"a".repeat(31)}=`, `${"a".repeat(31)}'`, "../".repeat(11)]) {
      expect(isToken(t)).toBe(false);
    }
  });
  it("can't be used to look up a draft or void contract", async () => {
    const id = await draft();
    const token = newToken();
    await db.update(schema.contracts).set({ token }).where(eq(schema.contracts.id, id));
    expect(await getContractByToken(token)).toBeNull();
    await db.update(schema.contracts).set({ status: "void" }).where(eq(schema.contracts.id, id));
    expect(await getContractByToken(token)).toBeNull();
    expect(await getContractByToken("not a token")).toBeNull();
  });
});

describe("contract lifecycle", () => {
  it("sending freezes the text and creates a working link", async () => {
    const id = await draft();
    await sendContract(id);
    const c = await load(id);
    expect(c.status).toBe("sent");
    expect(isToken(c.token!)).toBe(true);
    expect(c.bodyHash).toBe(hashBody(c.body));
    expect(c.sentAt).toBeInstanceOf(Date);
    expect((await getContractByToken(c.token!))?.contract.id).toBe(id);
  });

  it("sending again does nothing once sent (the link stays the same)", async () => {
    const id = await draft();
    await sendContract(id);
    const { token } = await load(id);
    await sendContract(id);
    expect((await load(id)).token).toBe(token);
  });

  it("withdrawing kills the old link; re-sending issues a new one", async () => {
    const id = await draft();
    await sendContract(id);
    const old = (await load(id)).token!;
    await withdrawContract(id);
    expect(await load(id)).toMatchObject({ status: "draft", token: null, bodyHash: null, sentAt: null });
    expect(await getContractByToken(old)).toBeNull();
    expect(await sign(old)).toBe(`/sign/${old}`);

    await sendContract(id);
    const fresh = (await load(id)).token!;
    expect(fresh).not.toBe(old);
    expect(await getContractByToken(old)).toBeNull();
    expect(await sign(fresh)).toBe(`/sign/${fresh}?signed=1`);
    expect((await load(id)).status).toBe("signed");
  });

  it("voiding kills the link and the contract can't be signed", async () => {
    const id = await draft();
    await sendContract(id);
    const token = (await load(id)).token!;
    await voidContract(id);
    expect(await load(id)).toMatchObject({ status: "void", token: null });
    expect(await sign(token)).toBe(`/sign/${token}`);
    expect((await load(id)).status).toBe("void");
  });

  it("a signed contract can't be withdrawn and stays viewable by its link", async () => {
    const id = await draft();
    await sendContract(id);
    const token = (await load(id)).token!;
    await sign(token);
    await withdrawContract(id);
    expect(await load(id)).toMatchObject({ status: "signed", token });
    expect((await getContractByToken(token))?.contract.status).toBe("signed");
  });

  it("signing records who, when and from where, once", async () => {
    const id = await draft();
    await sendContract(id);
    const token = (await load(id)).token!;
    expect(await sign(token)).toBe(`/sign/${token}?signed=1`);
    const c = await load(id);
    expect(c).toMatchObject({ status: "signed", signerName: "Kwame Mensah", signerIp: "203.0.113.7", signerAgent: "Test browser", signatureImage: null });
    expect(c.signedAt).toBeInstanceOf(Date);
    // Signing again doesn't overwrite the record.
    await sign(token, { name: "Someone Else" });
    expect((await load(id)).signerName).toBe("Kwame Mensah");
  });

  it("refuses to sign if the text changed after it was sent", async () => {
    const id = await draft();
    await sendContract(id);
    const token = (await load(id)).token!;
    await db.update(schema.contracts).set({ body: "1. Scope\nA parcel booking app. Fee doubled." }).where(eq(schema.contracts.id, id));
    expect(await sign(token)).toBe(`/sign/${token}?error=changed`);
    expect((await load(id)).status).toBe("sent");
  });

  it("checks the signer's details and signature image", async () => {
    const id = await draft();
    await sendContract(id);
    const token = (await load(id)).token!;
    expect(await sign(token, { consent: "" })).toBe(`/sign/${token}?error=details`);
    expect(await sign(token, { name: "K" })).toBe(`/sign/${token}?error=details`);
    expect(await sign(token, { signature: "data:image/svg+xml;base64,PHN2Zz4=" })).toBe(`/sign/${token}?error=signature`);
    expect(await sign(token, { signature: `data:image/png;base64,${"A".repeat(400_000)}` })).toBe(`/sign/${token}?error=signature`);
    expect(await sign("../../etc/passwd")).toBe("/");
    expect((await load(id)).status).toBe("sent");
    expect(await sign(token, { signature: "data:image/png;base64,iVBORw0KGgo=" })).toBe(`/sign/${token}?signed=1`);
    expect((await load(id)).signatureImage).toBe("data:image/png;base64,iVBORw0KGgo=");
  });

  it("only the signed-in owner can send, withdraw or void", async () => {
    const id = await draft();
    signedIn.value = false;
    await expect(sendContract(id)).rejects.toThrow("/login");
    await expect(voidContract(id)).rejects.toThrow("/login");
    await expect(withdrawContract(id)).rejects.toThrow("/login");
    expect((await load(id)).status).toBe("draft");
  });
});

describe("contractFileName", () => {
  it("removes characters that aren't allowed in file names", () => {
    expect(contractFileName('Web: "phase" 1/2', "Mighty <Courier>")).toBe("Web phase 12 - Mighty Courier.pdf");
  });
});
