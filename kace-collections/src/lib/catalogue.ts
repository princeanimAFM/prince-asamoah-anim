// The product catalogue. Until the admin is built, products live in this file.
// Prices, sizes, stock and which pieces are in stock or made to order are placeholders to
// confirm with the owner.

export type Gender = "women" | "men" | "unisex";
export type Category = "sets" | "jackets" | "trousers" | "dresses" | "kaftans" | "shirts" | "bags";

/**
 * "in-stock": ready to send, bought through the bag and checkout.
 * "made-to-order": made for the customer after they ask, through the custom order flow.
 */
export type Availability = "in-stock" | "made-to-order";

/** For made-to-order pieces, stock is ignored: the sizes are the ones the designer makes. */
export type Size = { label: string; stock: number };

export type Product = {
  slug: string;
  name: string;
  designer: string;
  gender: Gender;
  category: Category;
  availability: Availability;
  /** How long a made-to-order piece takes to make, e.g. "3 to 4 weeks". */
  makingTime?: string;
  /** Price in pence. For made-to-order pieces this is the starting price. */
  price: number;
  /** Original price in pence when on sale. */
  compareAt?: number;
  description: string;
  details: string[];
  sizes: Size[];
  /** Date added to the shop (YYYY-MM-DD), used for New arrivals. */
  addedAt: string;
  /** Product photo in /public/products. */
  photo: { src: string; alt: string };
};

export const CATEGORY_LABELS: Record<Category, string> = {
  sets: "Sets and co-ords",
  jackets: "Jackets",
  trousers: "Trousers",
  dresses: "Dresses",
  kaftans: "Kaftans",
  shirts: "Shirts",
  bags: "Bags",
};

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  "in-stock": "In stock",
  "made-to-order": "Made to order",
};

const sizes = (labels: string[], stock: number[]): Size[] => labels.map((label, i) => ({ label, stock: stock[i] ?? 0 }));

export const PRODUCTS: Product[] = [
  {
    slug: "patchwork-corduroy-trousers",
    availability: "in-stock",
    name: "Patchwork corduroy trousers, sunset",
    designer: "Kwadwo Man",
    gender: "unisex",
    category: "trousers",
    price: 8500,
    description: "Wide-leg trousers pieced together by hand from corduroy in mustard, wine, forest and cream, with patch pockets. No two pairs are the same.",
    details: ["Mixed cotton corduroy", "Elasticated waist", "Patch pockets", "One of a kind", "Made in Ghana by Kwadwo Man"],
    sizes: sizes(["S", "M", "L", "XL"], [1, 2, 2, 1]),
    addedAt: "2026-10-16",
    photo: { src: "/products/patchwork-corduroy-trousers-studio.jpg", alt: "Patchwork corduroy trousers in mustard, wine, green and cream, laid flat" },
  },
  {
    slug: "patchwork-corduroy-trousers-blush",
    availability: "in-stock",
    name: "Patchwork corduroy trousers, blush",
    designer: "Kwadwo Man",
    gender: "women",
    category: "trousers",
    price: 8500,
    description: "Relaxed patchwork trousers in blush pink, camel and chocolate corduroy, with a drawstring waist and turn-up hems.",
    details: ["Mixed cotton corduroy", "Drawstring waist", "Patch pockets", "One of a kind", "Made in Ghana by Kwadwo Man"],
    sizes: sizes(["S", "M", "L", "XL"], [1, 1, 1, 0]),
    addedAt: "2026-10-18",
    photo: { src: "/products/patchwork-pink-corduroy-trousers-studio.jpg", alt: "Patchwork trousers in pink, camel and brown corduroy, laid flat" },
  },
  {
    slug: "patchwork-corduroy-trousers-colour",
    availability: "made-to-order",
    makingTime: "3 to 4 weeks",
    name: "Patchwork corduroy trousers, multicolour",
    designer: "Kwadwo Man",
    gender: "men",
    category: "trousers",
    price: 8500,
    description: "Bright patchwork trousers in teal, orange, pink and grey corduroy with an elasticated waist.",
    details: ["Mixed cotton corduroy", "Elasticated waist", "Patch pockets", "One of a kind", "Made in Ghana by Kwadwo Man"],
    sizes: sizes(["S", "M", "L", "XL"], [0, 1, 1, 1]),
    addedAt: "2026-10-11",
    photo: { src: "/products/patchwork-corduroy-trousers-teal-studio.jpg", alt: "Multicolour patchwork corduroy trousers with teal, orange and pink panels" },
  },
  {
    slug: "patchwork-corduroy-set",
    availability: "made-to-order",
    makingTime: "3 to 4 weeks",
    name: "Patchwork corduroy jacket and trousers",
    designer: "Kwadwo Man",
    gender: "unisex",
    category: "sets",
    price: 18500,
    description: "A boxy trucker jacket in burnt orange, mustard and black corduroy, with matching patchwork trousers.",
    details: ["Mixed cotton corduroy", "Metal shank buttons", "Contrast topstitching", "Sold as a set", "Made in Ghana by Kwadwo Man"],
    sizes: sizes(["S", "M", "L", "XL"], [1, 1, 2, 1]),
    addedAt: "2026-10-14",
    photo: { src: "/products/patchwork-corduroy-set-studio.jpg", alt: "Patchwork corduroy jacket in orange, mustard and black, with patchwork trousers" },
  },
  {
    slug: "patchwork-denim-jacket",
    availability: "in-stock",
    name: "Patchwork denim jacket",
    designer: "Kwadwo Man",
    gender: "unisex",
    category: "jackets",
    price: 9800,
    compareAt: 12000,
    description: "Reworked denim in three washes and stone canvas, cut into a cropped, boxy jacket.",
    details: ["Reworked cotton denim and canvas", "Button front", "Contrast pockets", "Made in Ghana by Kwadwo Man"],
    sizes: sizes(["S", "M", "L", "XL"], [2, 2, 1, 1]),
    addedAt: "2026-09-12",
    photo: { src: "/products/patchwork-denim-jacket-studio.jpg", alt: "Cropped jacket in dark, mid and light denim with stone canvas panels" },
  },
  {
    slug: "patchwork-denim-trousers",
    availability: "made-to-order",
    makingTime: "2 to 3 weeks",
    name: "Patchwork denim trousers",
    designer: "Kwadwo Man",
    gender: "men",
    category: "trousers",
    price: 7500,
    description: "Straight-leg trousers rebuilt from denim and chino panels, with mismatched pockets.",
    details: ["Reworked denim and cotton twill", "Button fly", "Made in Ghana by Kwadwo Man"],
    sizes: sizes(["30", "32", "34", "36", "38"], [1, 2, 2, 1, 0]),
    addedAt: "2026-10-05",
    photo: { src: "/products/patchwork-denim-trousers-studio.jpg", alt: "Patchwork trousers in blue denim, khaki and cream panels with jeans pockets" },
  },
];

export const NEW_ARRIVAL_DAYS = 30;

export function getProduct(slug: string, products: Product[] = PRODUCTS): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function isOnSale(p: Product): boolean {
  return p.compareAt !== undefined && p.compareAt > p.price;
}

export function isMadeToOrder(p: Product): boolean {
  return p.availability === "made-to-order";
}

/** Sold out only applies to in-stock pieces: made-to-order pieces can always be requested. */
export function isSoldOut(p: Product): boolean {
  return !isMadeToOrder(p) && totalStock(p) === 0;
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
  availability?: Availability;
  sale?: boolean;
  newSince?: Date;
  sort?: Sort;
};

export function findProducts(filter: Filter, products: Product[] = PRODUCTS): Product[] {
  const list = products.filter((p) => {
    if (filter.gender && p.gender !== filter.gender && p.gender !== "unisex") return false;
    if (filter.category && p.category !== filter.category) return false;
    if (filter.availability && p.availability !== filter.availability) return false;
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
export function categoriesFor(filter: Omit<Filter, "category" | "availability" | "sort">, products: Product[] = PRODUCTS): Category[] {
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

export function parseAvailability(value: unknown): Availability | undefined {
  return value === "in-stock" || value === "made-to-order" ? value : undefined;
}
