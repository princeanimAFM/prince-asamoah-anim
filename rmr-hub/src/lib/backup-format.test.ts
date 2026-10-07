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

describe("damaged or hostile backup files", () => {
  const valid = () => JSON.parse(JSON.stringify(makeBackup(empty)));

  it("refuses a file with a section missing, rather than restoring it as empty", () => {
    // Restoring wipes every table first, so a missing section would delete those records.
    for (const name of TABLE_NAMES) {
      const b = valid();
      delete b.tables[name];
      expect(() => parseBackup(JSON.stringify(b)), name).toThrow(/damaged/);
    }
    expect(() => parseBackup(JSON.stringify({ ...valid(), tables: {} }))).toThrow(/damaged/);
    expect(() => parseBackup(JSON.stringify({ ...valid(), tables: [] }))).toThrow(/isn't an RMR Hub backup/);
  });

  it("refuses rows that aren't objects", () => {
    for (const row of [null, 1, "x", [1, 2]]) {
      expect(() => parseBackup(JSON.stringify({ ...valid(), tables: { ...valid().tables, clients: [row] } }))).toThrow(
        /Row 1 of clients is damaged/,
      );
    }
  });

  it("refuses more than one settings row, and versions that aren't numbers", () => {
    expect(() => parseBackup(JSON.stringify({ ...valid(), tables: { ...valid().tables, settings: [{ id: 1 }, { id: 2 }] } }))).toThrow(
      /settings section is damaged/,
    );
    expect(() => parseBackup(JSON.stringify({ ...valid(), version: "1" }))).toThrow(/newer version/);
  });

  it("ignores prototype tricks and unknown keys", () => {
    const text = `{"format":"rmr-hub-backup","version":1,"createdAt":"x","tables":${JSON.stringify(valid().tables).replace(
      '"clients":[]',
      '"clients":[{"id":1,"name":"K","__proto__":{"isAdmin":true},"constructor":{"prototype":{"polluted":true}}}]',
    )}}`;
    const row = parseBackup(text).tables.clients[0];
    expect(row).toEqual({ id: 1, name: "K" });
    expect(Object.getPrototypeOf(row)).toBe(Object.prototype);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(({} as Record<string, unknown>).isAdmin).toBeUndefined();
  });

  it("keeps null date-times and refuses impossible ones", () => {
    const b = valid();
    b.tables.contracts = [{ id: 1, sentAt: null, signedAt: "2026-10-02T10:00:00.000Z" }];
    expect(parseBackup(JSON.stringify(b)).tables.contracts[0]).toEqual({ id: 1, sentAt: null, signedAt: new Date("2026-10-02T10:00:00Z") });
    b.tables.contracts = [{ id: 1, signedAt: "2026-13-45" }];
    expect(() => parseBackup(JSON.stringify(b))).toThrow(/bad date/);
  });
});
