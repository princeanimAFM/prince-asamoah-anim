import { describe, expect, it } from "vitest";
import { getLook, LOOKS } from "./lookbook";
import { getProduct } from "./catalogue";

describe("lookbook", () => {
  it("finds looks only by exact slug", () => {
    expect(getLook("city-casual")?.title).toBe("City casual");
    expect(getLook("constructor")).toBeUndefined();
    expect(getLook(["city-casual"])).toBeUndefined();
    expect(getLook(undefined)).toBeUndefined();
  });
  it("only links to products that exist", () => {
    for (const look of LOOKS) for (const slug of look.products) expect(getProduct(slug), slug).toBeDefined();
  });
  it("has unique slugs and alt text", () => {
    expect(new Set(LOOKS.map((l) => l.slug)).size).toBe(LOOKS.length);
    for (const look of LOOKS) {
      expect(look.photos.length).toBeGreaterThan(0);
      for (const photo of look.photos) expect(photo.alt.length).toBeGreaterThan(10);
    }
  });
});
