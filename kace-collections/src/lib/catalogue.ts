// The product catalogue. Until the admin is built, products live in this file.
// Every product here is a SAMPLE for the starter look: replace with real items and photos.

export type Gender = "women" | "men" | "unisex";
export type Category = "dresses" | "tops" | "shirts" | "smocks" | "trousers" | "shoes" | "bags" | "fabric";
export type Silhouette = "dress" | "top" | "shirt" | "smock" | "trousers" | "shoe" | "bag" | "fabric";
export type PatternKind = "kente" | "wax" | "adinkra" | "stripe" | "solid";

export type Size = { label: string; stock: number };

export type Product = {
  slug: string;
  name: string;
  designer: string;
  gender: Gender;
  category: Category;
  /** Price in pence. */
  price: number;
  /** Original price in pence when on sale. */
  compareAt?: number;
  description: string;
  details: string[];
  sizes: Size[];
  /** Date added to the shop (YYYY-MM-DD), used for New arrivals. */
  addedAt: string;
  art: { silhouette: Silhouette; pattern: PatternKind; colors: string[] };
};

export const CATEGORY_LABELS: Record<Category, string> = {
  dresses: "Dresses",
  tops: "Tops",
  shirts: "Shirts",
  smocks: "Smocks",
  trousers: "Trousers",
  shoes: "Shoes",
  bags: "Bags",
  fabric: "Fabric",
};

const CLOTHING = ["XS", "S", "M", "L", "XL"];
const sizes = (labels: string[], stock: number[]): Size[] => labels.map((label, i) => ({ label, stock: stock[i] ?? 0 }));

export const PRODUCTS: Product[] = [
  {
    slug: "adwoa-kente-wrap-dress",
    name: "Adwoa kente wrap dress",
    designer: "Accra studio (sample)",
    gender: "women",
    category: "dresses",
    price: 9500,
    description: "A wrap dress cut from hand-woven kente strips, with a tie waist and flutter sleeves.",
    details: ["Hand-woven cotton kente", "Wrap front with tie waist", "Dry clean only", "Made in Ghana"],
    sizes: sizes(CLOTHING, [2, 4, 3, 1, 0]),
    addedAt: "2026-10-12",
    art: { silhouette: "dress", pattern: "kente", colors: ["#E2A31B", "#0E5E3C", "#B5281F", "#141414"] },
  },
  {
    slug: "efua-wax-print-maxi",
    name: "Efua wax print maxi",
    designer: "Kumasi atelier (sample)",
    gender: "women",
    category: "dresses",
    price: 7800,
    compareAt: 9800,
    description: "A floor-length maxi in bold wax print, with a fitted bodice and full skirt.",
    details: ["100% cotton wax print", "Concealed back zip", "Machine wash cold", "Made in Ghana"],
    sizes: sizes(CLOTHING, [1, 2, 2, 2, 1]),
    addedAt: "2026-09-02",
    art: { silhouette: "dress", pattern: "wax", colors: ["#1F3A93", "#F2B33D", "#E8E2D4"] },
  },
  {
    slug: "akosua-peplum-top",
    name: "Akosua peplum top",
    designer: "Accra studio (sample)",
    gender: "women",
    category: "tops",
    price: 4500,
    description: "A structured peplum top in adinkra print. Pairs with jeans or the matching skirt.",
    details: ["Cotton adinkra print", "Back zip", "Machine wash cold", "Made in Ghana"],
    sizes: sizes(CLOTHING, [3, 3, 3, 2, 2]),
    addedAt: "2026-10-15",
    art: { silhouette: "top", pattern: "adinkra", colors: ["#7A2E1F", "#F1E6D2"] },
  },
  {
    slug: "yaa-wide-leg-trousers",
    name: "Yaa wide-leg trousers",
    designer: "Kumasi atelier (sample)",
    gender: "women",
    category: "trousers",
    price: 5500,
    description: "High-waisted wide-leg trousers in a two-tone wax print, with side pockets.",
    details: ["100% cotton wax print", "Elasticated back waist", "Side pockets", "Made in Ghana"],
    sizes: sizes(CLOTHING, [0, 0, 0, 0, 0]),
    addedAt: "2026-08-20",
    art: { silhouette: "trousers", pattern: "wax", colors: ["#0E5E3C", "#E9C46A", "#F4EFE6"] },
  },
  {
    slug: "ama-woven-tote",
    name: "Ama woven tote",
    designer: "Bolgatanga weavers (sample)",
    gender: "unisex",
    category: "bags",
    price: 4200,
    description: "A roomy tote hand-woven from elephant grass, with leather handles.",
    details: ["Hand-woven elephant grass", "Leather handles", "About 40 × 35 cm", "Made in Ghana"],
    sizes: sizes(["One size"], [6]),
    addedAt: "2026-10-08",
    art: { silhouette: "bag", pattern: "stripe", colors: ["#C98B3C", "#8C3B2A", "#EADBC0"] },
  },
  {
    slug: "kwame-fugu-smock",
    name: "Kwame fugu smock",
    designer: "Tamale weavers (sample)",
    gender: "men",
    category: "smocks",
    price: 11000,
    description: "A traditional northern fugu smock, hand-woven in narrow strips and sewn together by hand.",
    details: ["Hand-woven cotton strips", "Hand-stitched", "Dry clean only", "Made in Ghana"],
    sizes: sizes(["S", "M", "L", "XL", "XXL"], [1, 2, 2, 1, 1]),
    addedAt: "2026-10-14",
    art: { silhouette: "smock", pattern: "stripe", colors: ["#1B2A4A", "#E8E2D4", "#B5281F"] },
  },
  {
    slug: "kofi-print-shirt",
    name: "Kofi short-sleeve print shirt",
    designer: "Accra studio (sample)",
    gender: "men",
    category: "shirts",
    price: 4800,
    compareAt: 6000,
    description: "A relaxed short-sleeve shirt in wax print, with a camp collar.",
    details: ["100% cotton wax print", "Camp collar", "Machine wash cold", "Made in Ghana"],
    sizes: sizes(["S", "M", "L", "XL", "XXL"], [2, 3, 3, 2, 1]),
    addedAt: "2026-07-30",
    art: { silhouette: "shirt", pattern: "wax", colors: ["#B5281F", "#F2B33D", "#141414"] },
  },
  {
    slug: "yaw-kente-trim-shirt",
    name: "Yaw kente trim shirt",
    designer: "Kumasi atelier (sample)",
    gender: "men",
    category: "shirts",
    price: 6500,
    description: "A long-sleeve linen shirt with a kente placket and cuffs.",
    details: ["Linen with kente trim", "Button front", "Machine wash cold", "Made in Ghana"],
    sizes: sizes(["S", "M", "L", "XL", "XXL"], [2, 2, 3, 2, 0]),
    addedAt: "2026-10-16",
    art: { silhouette: "shirt", pattern: "kente", colors: ["#F1E6D2", "#E2A31B", "#0E5E3C", "#141414"] },
  },
  {
    slug: "kojo-tailored-trousers",
    name: "Kojo tailored trousers",
    designer: "Accra studio (sample)",
    gender: "men",
    category: "trousers",
    price: 5800,
    description: "Slim tailored trousers in plain cotton, made to wear with the print shirts.",
    details: ["Cotton twill", "Zip fly", "Machine wash cold", "Made in Ghana"],
    sizes: sizes(["28", "30", "32", "34", "36"], [1, 2, 3, 2, 1]),
    addedAt: "2026-09-18",
    art: { silhouette: "trousers", pattern: "solid", colors: ["#2A2A2A"] },
  },
  {
    slug: "kwabena-leather-slides",
    name: "Kwabena leather slides",
    designer: "Tema shoemakers (sample)",
    gender: "men",
    category: "shoes",
    price: 5200,
    description: "Hand-stitched leather slides with a kente-strap detail.",
    details: ["Leather upper and sole", "Kente strap", "Hand-stitched", "Made in Ghana"],
    sizes: sizes(["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"], [1, 2, 2, 1, 0]),
    addedAt: "2026-10-10",
    art: { silhouette: "shoe", pattern: "kente", colors: ["#6B3E26", "#E2A31B", "#0E5E3C"] },
  },
  {
    slug: "esi-beaded-sandals",
    name: "Esi beaded sandals",
    designer: "Tema shoemakers (sample)",
    gender: "women",
    category: "shoes",
    price: 3900,
    compareAt: 4900,
    description: "Flat leather sandals with hand-strung Krobo glass beads.",
    details: ["Leather sole and straps", "Krobo glass beads", "Hand-made", "Made in Ghana"],
    sizes: sizes(["UK 3", "UK 4", "UK 5", "UK 6", "UK 7"], [1, 3, 3, 2, 1]),
    addedAt: "2026-08-05",
    art: { silhouette: "shoe", pattern: "adinkra", colors: ["#8C3B2A", "#F2B33D"] },
  },
  {
    slug: "ghana-wax-print-6-yards",
    name: "Wax print fabric, 6 yards",
    designer: "Accra market (sample)",
    gender: "unisex",
    category: "fabric",
    price: 3500,
    description: "A full 6-yard piece of wax print, enough for a dress or a two-piece set.",
    details: ["100% cotton", "6 yards (about 5.5 m)", "Width about 115 cm", "Printed in Ghana"],
    sizes: sizes(["6 yards"], [8]),
    addedAt: "2026-10-01",
    art: { silhouette: "fabric", pattern: "wax", colors: ["#E76F24", "#1F3A93", "#F4EFE6"] },
  },
  {
    slug: "nana-kente-stole",
    name: "Nana kente stole",
    designer: "Bonwire weavers (sample)",
    gender: "unisex",
    category: "fabric",
    price: 3000,
    description: "A narrow hand-woven kente stole, for graduations, weddings and church.",
    details: ["Hand-woven", "About 180 × 12 cm", "Woven in Bonwire, Ghana"],
    sizes: sizes(["One size"], [10]),
    addedAt: "2026-10-17",
    art: { silhouette: "fabric", pattern: "kente", colors: ["#E2A31B", "#B5281F", "#0E5E3C", "#141414"] },
  },
  {
    slug: "abena-adinkra-midi",
    name: "Abena adinkra midi dress",
    designer: "Kumasi atelier (sample)",
    gender: "women",
    category: "dresses",
    price: 8200,
    description: "A midi shirt dress stamped with adinkra symbols, with a self-tie belt.",
    details: ["Cotton", "Hand-stamped adinkra", "Self-tie belt", "Made in Ghana"],
    sizes: sizes(CLOTHING, [1, 1, 2, 1, 1]),
    addedAt: "2026-09-25",
    art: { silhouette: "dress", pattern: "adinkra", colors: ["#141414", "#E8E2D4"] },
  },
];

export const NEW_ARRIVAL_DAYS = 30;

export function getProduct(slug: string, products: Product[] = PRODUCTS): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function isOnSale(p: Product): boolean {
  return p.compareAt !== undefined && p.compareAt > p.price;
}

export function totalStock(p: Product): number {
  return p.sizes.reduce((sum, s) => sum + s.stock, 0);
}

export function isNewArrival(p: Product, today: Date, days = NEW_ARRIVAL_DAYS): boolean {
  const added = Date.parse(p.addedAt + "T00:00:00Z");
  return today.getTime() - added <= days * 86_400_000;
}

export type Sort = "newest" | "price-asc" | "price-desc";

export type Filter = {
  gender?: "women" | "men";
  category?: Category;
  sale?: boolean;
  newSince?: Date;
  sort?: Sort;
};

export function findProducts(filter: Filter, products: Product[] = PRODUCTS): Product[] {
  const list = products.filter((p) => {
    if (filter.gender && p.gender !== filter.gender && p.gender !== "unisex") return false;
    if (filter.category && p.category !== filter.category) return false;
    if (filter.sale && !isOnSale(p)) return false;
    if (filter.newSince && !isNewArrival(p, filter.newSince)) return false;
    return true;
  });
  const sort = filter.sort ?? "newest";
  return list.sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    return b.addedAt.localeCompare(a.addedAt);
  });
}

/** Categories that have at least one product, in display order. */
export function categoriesFor(filter: Omit<Filter, "category" | "sort">, products: Product[] = PRODUCTS): Category[] {
  const found = new Set(findProducts(filter, products).map((p) => p.category));
  return (Object.keys(CATEGORY_LABELS) as Category[]).filter((c) => found.has(c));
}

// URL values can be missing, repeated (arrays) or anything a visitor types.
export function parseCategory(value: unknown): Category | undefined {
  return typeof value === "string" && Object.hasOwn(CATEGORY_LABELS, value) ? (value as Category) : undefined;
}

export function parseSort(value: unknown): Sort {
  return value === "price-asc" || value === "price-desc" ? value : "newest";
}
