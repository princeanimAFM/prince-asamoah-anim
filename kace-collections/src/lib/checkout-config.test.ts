import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { checkoutStatus } = await import("./checkout-config");

describe("checkoutStatus", () => {
  it("stays closed without keys or a proper site address", () => {
    expect(checkoutStatus({}).ready).toBe(false);
    expect(checkoutStatus({ STRIPE_SECRET_KEY: "sk_test_abc" }).ready).toBe(false);
    expect(checkoutStatus({ STRIPE_SECRET_KEY: "sk_test_abc", SITE_URL: "http://kace.example" }).ready).toBe(false);
    expect(checkoutStatus({ STRIPE_SECRET_KEY: "pk_test_abc", SITE_URL: "https://kace.example" }).ready).toBe(false);
  });
  it("opens with test keys during the preview", () => {
    const s = checkoutStatus({ STRIPE_SECRET_KEY: "sk_test_abc123", SITE_URL: "https://kace.example/" });
    expect(s).toMatchObject({ ready: true, siteUrl: "https://kace.example", testMode: true });
  });
  it("refuses live keys while the shop is in preview", () => {
    expect(checkoutStatus({ STRIPE_SECRET_KEY: "sk_live_abc123", SITE_URL: "https://kace.example" }).ready).toBe(false);
  });
});
