import { describe, expect, it } from "vitest";
import config from "../../next.config";

async function headersFor(path: string) {
  const rules = (await config.headers!()) ?? [];
  const out: Record<string, string> = {};
  for (const r of rules) {
    const prefix = r.source.replace(/:path\*$/, "");
    if (path.startsWith(prefix)) for (const h of r.headers) out[h.key] = h.value;
  }
  return out;
}

describe("security headers", () => {
  it("stops every page being framed or type-sniffed", async () => {
    const h = await headersFor("/settings");
    expect(h["X-Frame-Options"]).toBe("DENY");
    expect(h["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
    expect(h["X-Content-Type-Options"]).toBe("nosniff");
    expect(h["Strict-Transport-Security"]).toMatch(/max-age=\d+/);
  });

  it("never leaks a signing link as a referrer", async () => {
    const h = await headersFor("/sign/abc");
    expect(h["Referrer-Policy"]).toBe("no-referrer");
    expect(h["X-Frame-Options"]).toBe("DENY");
  });
});
