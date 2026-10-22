import { describe, expect, it } from "vitest";
import { isNewVersion } from "./errors";

describe("isNewVersion", () => {
  it("spots errors caused by an update going live mid-session", () => {
    expect(isNewVersion(new Error('Failed to find Server Action "7f3a". This request might be from an older or newer deployment.'))).toBe(true);
    expect(isNewVersion({ message: "ChunkLoadError: Loading chunk 123 failed." })).toBe(true);
  });
  it("leaves other errors alone", () => {
    expect(isNewVersion(new Error("Choose a client"))).toBe(false);
    expect(isNewVersion(undefined)).toBe(false);
  });
});
