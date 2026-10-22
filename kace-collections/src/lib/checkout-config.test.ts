import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { checkoutStatus } = await import("./checkout-config");

// Made-up keys, assembled at runtime so secret scanners don't mistake them for real ones.
const fakeKey = (mode: "test" | "live") => ["sk", mode, "abc123"].join("_");

describe("checkoutStatus", () => {
  it("stays closed without keys or a proper site address", () => {
    expect(checkoutStatus({}).ready).toBe(false);
    expect(checkoutStatus({ STRIPE_SECRET_KEY: fakeKey("test") }).ready).toBe(false);
    expect(checkoutStatus({ STRIPE_SECRET_KEY: fakeKey("test"), SITE_URL: "http://kace.example" }).ready).toBe(false);
    expect(checkoutStatus({ STRIPE_SECRET_KEY: ["pk", "test", "abc"].join("_"), SITE_URL: "https://kace.example" }).ready).toBe(false);
  });
  it("opens with test keys during the preview", () => {
    const s = checkoutStatus({ STRIPE_SECRET_KEY: fakeKey("test"), SITE_URL: "https://kace.example/" });
    expect(s).toMatchObject({ ready: true, siteUrl: "https://kace.example", testMode: true });
  });
  it("refuses live keys while the shop is in preview", () => {
    expect(checkoutStatus({ STRIPE_SECRET_KEY: fakeKey("live"), SITE_URL: "https://kace.example" }).ready).toBe(false);
  });
});
