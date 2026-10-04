import { describe, expect, it } from "vitest";
import { type Backup, makeBackup, parseBackup, TABLE_NAMES } from "./backup-format";

const empty = Object.fromEntries(TABLE_NAMES.map((t) => [t, []])) as unknown as Backup["tables"];

describe("backup file", () => {
  it("round-trips rows, turning date-times back into Dates", () => {
    const created = new Date("2026-10-04T08:00:00Z");
    const b = makeBackup({
      ...empty,
      clients: [{ id: 1, name: "Kwame", company: "Mighty", createdAt: created, archived: false }],
      invoices: [{ id: 2, number: "RMR-0001", clientId: 1, issueDate: "2026-10-01", emailedAt: null, createdAt: created }],
    });
    const back = parseBackup(JSON.stringify(b));
    expect(back.tables.clients[0]).toEqual({ id: 1, name: "Kwame", company: "Mighty", createdAt: created, archived: false });
    expect(back.tables.invoices[0].issueDate).toBe("2026-10-01");
    expect(back.tables.invoices[0].emailedAt).toBeNull();
    expect(back.tables.contracts).toEqual([]);
  });

  it("drops columns the app doesn't know", () => {
    const b = makeBackup({ ...empty, clients: [{ id: 1, name: "K", isAdmin: true }] });
    expect(parseBackup(JSON.stringify(b)).tables.clients[0]).toEqual({ id: 1, name: "K" });
  });

  it("refuses files that aren't backups", () => {
    expect(() => parseBackup("not json")).toThrow(/isn't valid JSON/);
    expect(() => parseBackup('{"format":"other"}')).toThrow(/isn't an RMR Hub backup/);
    expect(() => parseBackup(JSON.stringify({ ...makeBackup(empty), version: 99 }))).toThrow(/newer version/);
    expect(() => parseBackup(JSON.stringify(makeBackup({ ...empty, clients: "x" as never })))).toThrow(/damaged/);
    expect(() => parseBackup(JSON.stringify(makeBackup({ ...empty, clients: [{ id: 1, createdAt: "nope" }] })))).toThrow(
      /bad date/,
    );
  });
});
