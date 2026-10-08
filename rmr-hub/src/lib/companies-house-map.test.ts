import { describe, expect, it } from "vitest";
import { cleanQuery, formatAddress, toMatches } from "./companies-house-map";

describe("Companies House results", () => {
  it("formats a registered office address one part per line", () => {
    expect(
      formatAddress({
        premises: "Unit 4",
        address_line_1: "Riverside Park",
        address_line_2: " Clyde  Street ",
        locality: "Glasgow",
        postal_code: "G1 4AA",
        country: "Scotland",
      }),
    ).toBe("Unit 4 Riverside Park\nClyde Street\nGlasgow\nG1 4AA");
    expect(formatAddress({ address_line_1: "1 Rue X", locality: "Paris", country: "France" })).toBe("1 Rue X\nParis\nFrance");
    expect(formatAddress(undefined)).toBe("");
  });

  it("keeps only usable matches", () => {
    const m = toMatches([
      {
        title: "KM EXPRESS COURIERS LTD",
        company_number: "SC123456",
        company_status: "active",
        address: { address_line_1: "2 Main Road", locality: "Paisley", postal_code: "PA1 1AA" },
      },
      { title: "NO NUMBER LTD" },
      { company_number: "00000001", address_snippet: "1 High St, Leeds, LS1 1AA", title: "OLD CO" },
      null,
    ]);
    expect(m).toEqual([
      { number: "SC123456", name: "KM EXPRESS COURIERS LTD", status: "active", address: "2 Main Road\nPaisley\nPA1 1AA" },
      { number: "00000001", name: "OLD CO", status: "", address: "1 High St\nLeeds\nLS1 1AA" },
    ]);
    expect(toMatches(undefined)).toEqual([]);
  });

  it("cleans the search text", () => {
    expect(cleanQuery("  km\nexpress ")).toBe("km express");
    expect(cleanQuery("k")).toBeNull();
    expect(cleanQuery("x".repeat(300))).toHaveLength(100);
  });
});
