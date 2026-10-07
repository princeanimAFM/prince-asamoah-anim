import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { resetTestDb, useTestDb } from "@/test/db";
import { makeBackup, TABLE_NAMES } from "./backup-format";
import { collectBackup, restoreBackup, runBackup } from "./backup";

vi.mock("server-only", () => ({}));

const saved: { folder: string; name: string; text: string }[] = [];
vi.mock("@/lib/google", () => ({
  saveToDrive: vi.fn(async (o: { folder: string; name: string; data: Uint8Array }) => {
    saved.push({ folder: o.folder, name: o.name, text: new TextDecoder().decode(o.data) });
    return { id: `file_${saved.length}`, link: `https://drive.example/${saved.length}` };
  }),
}));

let db: Awaited<ReturnType<typeof useTestDb>>;

beforeAll(async () => {
  db = await useTestDb();
});

beforeEach(async () => {
  saved.length = 0;
  await resetTestDb(db);
  await db.update(schema.settings).set({ businessName: "RMR Dev Works", lastBackupAt: null }).where(eq(schema.settings.id, 1));
});

async function seed() {
  const [client] = await db
    .insert(schema.clients)
    .values({ name: "Kwame", company: "=HYPERLINK(\"http://evil\")", email: "k@example.com" })
    .returning();
  const [inv] = await db
    .insert(schema.invoices)
    .values({ number: "RMR-0001", clientId: client.id, issueDate: "2026-10-01", dueDate: "2026-10-15", status: "paid", paidDate: "2026-10-05" })
    .returning();
  await db.insert(schema.invoiceItems).values({ invoiceId: inv.id, description: "Website, phase 1", quantity: 150, unitPrice: 3_500 });
  await db.insert(schema.timeEntries).values({ clientId: client.id, date: "2026-09-30", minutes: 90, invoiceId: inv.id });
  await db.insert(schema.transactions).values([
    { date: "2026-10-05", description: "Kwame · RMR-0001", amount: 5_250, kind: "income", externalId: "tx_1", invoiceId: inv.id },
    { date: "2026-10-06", description: "@SUM(1)", amount: -1_800, kind: "expense" },
  ]);
  await db.insert(schema.contracts).values({
    clientId: client.id,
    title: "Website",
    body: "Terms",
    status: "signed",
    token: "a".repeat(32),
    signedAt: new Date("2026-10-02T10:00:00Z"),
    signerName: "Kwame",
  });
  await db.insert(schema.driveFolders).values({ path: "Invoices", folderId: "fold_1" });
  await db.update(schema.settings).set({ businessName: "RMR Test" }).where(eq(schema.settings.id, 1));
  return { client, inv };
}

const counts = async () =>
  Object.fromEntries(
    await Promise.all(
      [schema.clients, schema.invoices, schema.invoiceItems, schema.timeEntries, schema.transactions, schema.contracts].map(
        async (t, i) => [i, (await db.select().from(t)).length],
      ),
    ),
  );

describe("backup and restore", () => {
  it("restores exactly what was backed up", async () => {
    await seed();
    const before = await collectBackup();
    // Things change after the backup…
    await db.delete(schema.transactions);
    await db.insert(schema.clients).values({ name: "Added later" });
    await db.update(schema.settings).set({ businessName: "Changed" }).where(eq(schema.settings.id, 1));

    const restored = await restoreBackup(JSON.stringify(before));
    expect(restored).toMatchObject({ clients: 1, invoices: 1, invoiceItems: 1, timeEntries: 1, transactions: 2, contracts: 1, settings: 1, driveFolders: 1 });

    const after = await collectBackup();
    for (const name of TABLE_NAMES) expect(after.tables[name], name).toEqual(before.tables[name]);
    expect(after.tables.settings[0].businessName).toBe("RMR Test");
    expect(after.tables.contracts[0].signedAt).toEqual(new Date("2026-10-02T10:00:00Z"));
  });

  it("carries on numbering new records after the restored ones", async () => {
    const { client } = await seed();
    const backup = JSON.stringify(await collectBackup());
    await resetTestDb(db);
    await restoreBackup(backup);
    const [next] = await db.insert(schema.clients).values({ name: "New" }).returning();
    expect(next.id).toBe(client.id + 1);
  });

  it("keeps the Google and Monzo connections", async () => {
    await seed();
    await db.insert(schema.monzoAccount).values({ id: 1, accessToken: "secret" });
    await restoreBackup(JSON.stringify(makeBackup(Object.fromEntries(TABLE_NAMES.map((t) => [t, []])) as never)));
    expect(await db.select().from(schema.monzoAccount)).toHaveLength(1);
    // An empty backup still leaves a settings row for the app to run with.
    expect(await db.select().from(schema.settings)).toHaveLength(1);
  });

  it("never includes sign-in tokens in the backup", async () => {
    await seed();
    await db.insert(schema.monzoAccount).values({ id: 1, accessToken: "monzo-secret", refreshToken: "monzo-refresh" });
    await db.insert(schema.googleAccount).values({ id: 1, email: "p@example.com", refreshToken: "google-refresh" });
    const text = JSON.stringify(await collectBackup());
    expect(text).not.toMatch(/monzo-secret|monzo-refresh|google-refresh/);
  });

  it("changes nothing when a backup fails part-way through restoring", async () => {
    await seed();
    const good = await collectBackup();
    const before = await counts();
    // An invoice line pointing at an invoice that doesn't exist breaks the restore after the wipe.
    const broken = { ...good, tables: { ...good.tables, invoiceItems: [{ id: 9, invoiceId: 999, description: "x", unitPrice: 1 }] } };
    await expect(restoreBackup(JSON.stringify(broken))).rejects.toThrow();
    expect(await counts()).toEqual(before);
    expect((await db.select().from(schema.settings))[0].businessName).toBe("RMR Test");
  });

  it("changes nothing for a hostile file with values of the wrong type", async () => {
    await seed();
    const good = await collectBackup();
    const before = await counts();
    const hostile = { ...good, tables: { ...good.tables, clients: [{ id: "1; drop table clients; --", name: "x" }] } };
    await expect(restoreBackup(JSON.stringify(hostile))).rejects.toThrow();
    expect(await counts()).toEqual(before);
  });

  it("refuses files that aren't backups before touching anything", async () => {
    await seed();
    const before = await counts();
    for (const bad of ["", "null", "[]", '{"format":"rmr-hub-backup","version":1,"tables":[]}', '{"format":"rmr-hub-backup","version":1,"tables":{}}']) {
      await expect(restoreBackup(bad), bad).rejects.toThrow();
    }
    expect(await counts()).toEqual(before);
  });
});

describe("runBackup", () => {
  it("saves the restorable file and spreadsheets that can't run formulas", async () => {
    await seed();
    const { link, date } = await runBackup();
    expect(link).toBe("https://drive.example/1");
    expect(saved[0]).toMatchObject({ folder: `Backups/${date.slice(0, 4)}`, name: `RMR Hub backup ${date}.json` });
    expect(JSON.parse(saved[0].text).tables.clients[0].name).toBe("Kwame");

    const sheet = (name: string) => saved.find((s) => s.name === name)!.text;
    expect(saved.slice(1).map((s) => s.name).sort()).toEqual(
      ["Clients.csv", "Contracts.csv", "Hours.csv", "Invoice lines.csv", "Invoices.csv", "Money in and out.csv"],
    );
    expect(sheet("Clients.csv").split("\n")[1]).toBe(`Kwame,"'=HYPERLINK(""http://evil"")",k@example.com,,,,no`);
    expect(sheet("Invoices.csv").split("\n")[1]).toBe(`RMR-0001,"'=HYPERLINK(""http://evil"")",2026-10-01,2026-10-15,paid,52.50,2026-10-05,`);
    expect(sheet("Invoice lines.csv").split("\n")[1]).toBe(`RMR-0001,"Website, phase 1",1.5,35.00`);
    expect(sheet("Money in and out.csv")).toContain("\n2026-10-06,'@SUM(1),expense,-18.00,,manual");
    expect(sheet("Hours.csv").split("\n")[1]).toBe(`2026-09-30,"'=HYPERLINK(""http://evil"")",1.50,,yes`);
    expect(sheet("Contracts.csv").split("\n")[1]).toBe(`Website,"'=HYPERLINK(""http://evil"")",signed,,2026-10-02,Kwame`);

    const [s] = await db.select().from(schema.settings);
    expect(s.lastBackupAt).toBeInstanceOf(Date);
  });
});
