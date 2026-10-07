import { describe, expect, it } from "vitest";
import { SIGNED_LINK_DAYS, clientIp, signingLinkOpen } from "./signing";

const headers = (h: Record<string, string>) => ({ get: (k: string) => h[k.toLowerCase()] ?? null });
const now = new Date("2026-10-07T12:00:00Z");
const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

describe("signing link", () => {
  it("opens only for sent contracts and recently signed ones", () => {
    expect(signingLinkOpen({ status: "sent", signedAt: null }, now)).toBe(true);
    expect(signingLinkOpen({ status: "draft", signedAt: null }, now)).toBe(false);
    expect(signingLinkOpen({ status: "void", signedAt: daysAgo(1) }, now)).toBe(false);
    expect(signingLinkOpen({ status: "signed", signedAt: daysAgo(1) }, now)).toBe(true);
    expect(signingLinkOpen({ status: "signed", signedAt: daysAgo(SIGNED_LINK_DAYS + 1) }, now)).toBe(false);
    expect(signingLinkOpen({ status: "signed", signedAt: null }, now)).toBe(false);
  });

  it("records the IP the host saw, not one the browser claims", () => {
    const netlify = { NETLIFY: "true" };
    const vercel = { VERCEL: "1" };
    const spoof = { "x-forwarded-for": "6.6.6.6, 1.2.3.4", "x-nf-client-connection-ip": "1.2.3.4", "x-real-ip": "5.6.7.8" };
    expect(clientIp(headers(spoof), netlify)).toBe("1.2.3.4");
    expect(clientIp(headers(spoof), vercel)).toBe("5.6.7.8");
    // On Vercel a browser-sent Netlify header is ignored.
    expect(clientIp(headers({ "x-nf-client-connection-ip": "6.6.6.6", "x-real-ip": "5.6.7.8" }), vercel)).toBe("5.6.7.8");
    expect(clientIp(headers({ "x-forwarded-for": "9.9.9.9, 10.0.0.1" }), {})).toBe("9.9.9.9");
    expect(clientIp(headers({}), {})).toBe("");
  });
});
