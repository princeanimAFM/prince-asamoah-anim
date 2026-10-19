// The product catalogue. Until the admin is built, products live in this file.
// Every product here is a SAMPLE for the starter look: replace with real items and photos.

export type Gender = "women" | "men" | "unisex";
export type Category = "sets" | "jackets" | "trousers" | "dresses" | "kaftans" | "shirts" | "bags";
export type Silhouette = "dress" | "kaftan" | "tunicSet" | "set" | "jacket" | "shirt" | "trousers" | "bag";
export type PatternKind = "patchwork" | "denim" | "leather" | "printTrim" | "dye" | "stripe" | "solid";

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
  /** Real product photo in /public/products. Used instead of the drawn illustration. */
  photo?: { src: string; alt: string };
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

const CLOTHING = ["XS", "S", "M", "L", "XL"];
const MENS = ["S", "M", "L", "XL", "XXL"];
const sizes = (labels: string[], stock: number[]): Size[] => labels.map((label, i) => ({ label, stock: stock[i] ?? 0 }));

const CORD = ["#C8862E", "#8C2F23", "#2F4A3A", "#E7C27A", "#F1E9DA", "#3B3A4F", "#B9A28A"];
const DENIM = ["#1F3557", "#5B7FA6", "#EBE3D2"];

export const PRODUCTS: Product[] = [
  {
    slug: "patchwork-corduroy-trousers",
    name: "Patchwork corduroy trousers, sunset",
    designer: "Kwadwo Man",
    gender: "unisex",
    category: "trousers",
    price: 8500,
    description: "Wide-leg trousers pieced together by hand from corduroy in mustard, wine, forest and cream, with patch pockets. No two pairs are the same.",
    details: ["Mixed cotton corduroy", "Elasticated waist", "Patch pockets", "One of a kind", "Made in Ghana by Kwadwo Man"],
    sizes: sizes(["S", "M", "L", "XL"], [1, 2, 2, 1]),
    addedAt: "2026-10-16",
    art: { silhouette: "trousers", pattern: "patchwork", colors: CORD },
    photo: { src: "/products/patchwork-corduroy-trousers.jpg", alt: "Patchwork corduroy trousers in mustard, wine, green and cream, laid flat" },
  },
  {
    slug: "patchwork-corduroy-trousers-blush",
    name: "Patchwork corduroy trousers, blush",
    designer: "Kwadwo Man",
    gender: "women",
    category: "trousers",
    price: 8500,
    description: "Relaxed patchwork trousers in blush pink, camel and chocolate corduroy, with a drawstring waist and turn-up hems.",
    details: ["Mixed cotton corduroy", "Drawstring waist", "Patch pockets", "One of a kind", "Made in Ghana by Kwadwo Man"],
    sizes: sizes(["S", "M", "L", "XL"], [1, 1, 1, 0]),
    addedAt: "2026-10-18",
    art: { silhouette: "trousers", pattern: "patchwork", colors: ["#E8A7A7", "#C9A06B", "#6B3E26", "#3B3A4F", "#F1E9DA"] },
    photo: { src: "/products/patchwork-pink-corduroy-trousers.jpg", alt: "Patchwork trousers in pink, camel and brown corduroy, laid flat" },
  },
  {
    slug: "patchwork-corduroy-trousers-colour",
    name: "Patchwork corduroy trousers, multicolour",
    designer: "Kwadwo Man",
    gender: "men",
    category: "trousers",
    price: 8500,
    description: "Bright patchwork trousers in teal, orange, pink and grey corduroy with an elasticated waist.",
    details: ["Mixed cotton corduroy", "Elasticated waist", "Patch pockets", "One of a kind", "Made in Ghana by Kwadwo Man"],
    sizes: sizes(["S", "M", "L", "XL"], [0, 1, 1, 1]),
    addedAt: "2026-10-11",
    art: { silhouette: "trousers", pattern: "patchwork", colors: ["#E9A33A", "#2F7F8C", "#8C2F23", "#E8A7A7", "#8A8A8A"] },
    photo: { src: "/products/patchwork-corduroy-trousers-teal.jpg", alt: "Multicolour patchwork corduroy trousers with teal, orange and pink panels" },
  },
  {
    slug: "patchwork-corduroy-set",
    name: "Patchwork corduroy jacket and trousers",
    designer: "Kwadwo Man",
    gender: "unisex",
    category: "sets",
    price: 18500,
    description: "A boxy trucker jacket in burnt orange, mustard and black corduroy, with matching patchwork trousers.",
    details: ["Mixed cotton corduroy", "Metal shank buttons", "Contrast topstitching", "Sold as a set", "Made in Ghana by Kwadwo Man"],
    sizes: sizes(["S", "M", "L", "XL"], [1, 1, 2, 1]),
    addedAt: "2026-10-14",
    art: { silhouette: "set", pattern: "patchwork", colors: ["#D98A2B", "#8C2F23", "#1E1E1E", "#7A6A3A", "#C9A77C"] },
    photo: { src: "/products/patchwork-corduroy-set.jpg", alt: "Patchwork corduroy jacket in orange, mustard and black, with patchwork trousers" },
  },
  {
    slug: "patchwork-denim-jacket",
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
    art: { silhouette: "jacket", pattern: "patchwork", colors: ["#1F3557", "#5B7FA6", "#9DB6D3", "#EBE3D2"] },
    photo: { src: "/products/patchwork-denim-jacket.jpg", alt: "Cropped jacket in dark, mid and light denim with stone canvas panels" },
  },
  {
    slug: "patchwork-denim-trousers",
    name: "Patchwork denim trousers",
    designer: "Kwadwo Man",
    gender: "men",
    category: "trousers",
    price: 7500,
    description: "Straight-leg trousers rebuilt from denim and chino panels, with mismatched pockets.",
    details: ["Reworked denim and cotton twill", "Button fly", "Made in Ghana by Kwadwo Man"],
    sizes: sizes(["30", "32", "34", "36", "38"], [1, 2, 2, 1, 0]),
    addedAt: "2026-10-05",
    art: { silhouette: "trousers", pattern: "patchwork", colors: ["#1F3557", "#5B7FA6", "#D8C8A6", "#7A5C45"] },
    photo: { src: "/products/patchwork-denim-trousers.jpg", alt: "Patchwork trousers in blue denim, khaki and cream panels with jeans pockets" },
  },
  {
    slug: "raw-denim-co-ord",
    name: "Raw denim shirt and wide-leg set",
    designer: "Kumasi denim workshop (sample)",
    gender: "women",
    category: "sets",
    price: 12500,
    description: "A cropped short-sleeve denim shirt and matching wide-leg trousers with contrast topstitching.",
    details: ["Rigid cotton denim", "Contrast topstitching", "Sold as a set", "Made in Ghana"],
    sizes: sizes(CLOTHING, [1, 2, 2, 1, 1]),
    addedAt: "2026-10-17",
    art: { silhouette: "set", pattern: "denim", colors: DENIM },
  },
  {
    slug: "brown-denim-cargo-set",
    name: "Brown denim cargo set",
    designer: "Kumasi denim workshop (sample)",
    gender: "men",
    category: "sets",
    price: 13500,
    description: "A cropped trucker jacket and wide cargo trousers in brown denim with white topstitching.",
    details: ["Cotton denim", "White contrast stitching", "Cargo pockets", "Sold as a set", "Made in Ghana"],
    sizes: sizes(MENS, [1, 2, 2, 1, 1]),
    addedAt: "2026-10-10",
    art: { silhouette: "set", pattern: "denim", colors: ["#6E5440", "#A68B70", "#F4EFE6"] },
  },
  {
    slug: "black-leather-jacket",
    name: "Black leather jacket",
    designer: "Tema leather works (sample)",
    gender: "men",
    category: "jackets",
    price: 18500,
    description: "A clean-lined zip jacket in soft black leather, with a shirt collar and slanted pockets.",
    details: ["Leather outer, cotton lining", "Metal zip", "Two slanted pockets", "Made in Ghana"],
    sizes: sizes(MENS, [1, 1, 2, 1, 0]),
    addedAt: "2026-09-28",
    art: { silhouette: "jacket", pattern: "leather", colors: ["#151515"] },
  },
  {
    slug: "tan-leather-biker",
    name: "Tan leather biker jacket",
    designer: "Tema leather works (sample)",
    gender: "women",
    category: "jackets",
    price: 17500,
    description: "A cropped biker jacket in tan leather with an asymmetric zip.",
    details: ["Leather outer, cotton lining", "Asymmetric zip", "Made in Ghana"],
    sizes: sizes(CLOTHING, [0, 0, 0, 0, 0]),
    addedAt: "2026-08-22",
    art: { silhouette: "jacket", pattern: "leather", colors: ["#B9772E"] },
  },
  {
    slug: "print-trim-tunic-set",
    name: "Print-trim tunic and trousers",
    designer: "Accra tailoring house (sample)",
    gender: "women",
    category: "sets",
    price: 9500,
    description: "A long brown tunic with a printed placket and pocket, worn over straight trousers.",
    details: ["Textured crepe with printed trim", "Side slits", "Sold as a set", "Made in Ghana"],
    sizes: sizes(CLOTHING, [2, 3, 3, 2, 1]),
    addedAt: "2026-10-12",
    art: { silhouette: "tunicSet", pattern: "printTrim", colors: ["#5A3A28", "#E9DFCF", "#B5281F", "#E2A31B", "#141414"] },
  },
  {
    slug: "embroidered-tunic-set",
    name: "Embroidered tunic set",
    designer: "Accra tailoring house (sample)",
    gender: "women",
    category: "sets",
    price: 8800,
    compareAt: 11000,
    description: "A wine-red tunic with an embroidered neckline and matching straight trousers.",
    details: ["Cotton-linen blend", "Hand-finished embroidery", "Side pockets", "Made in Ghana"],
    sizes: sizes(CLOTHING, [1, 2, 2, 1, 1]),
    addedAt: "2026-09-05",
    art: { silhouette: "tunicSet", pattern: "solid", colors: ["#7E1D2A"] },
  },
  {
    slug: "stripe-panel-shift-dress",
    name: "Stripe-panel shift dress",
    designer: "Bolgatanga weavers (sample)",
    gender: "women",
    category: "dresses",
    price: 6800,
    description: "A relaxed shift dress in sand linen, with hand-woven striped panels down the front and on the pockets.",
    details: ["Linen with hand-woven panels", "Notch neckline", "Two pockets", "Made in Ghana"],
    sizes: sizes(CLOTHING, [2, 3, 2, 2, 1]),
    addedAt: "2026-10-08",
    art: { silhouette: "dress", pattern: "stripe", colors: ["#7E1D2A", "#8A8A8A", "#D8C29A"] },
  },
  {
    slug: "adire-indigo-kaftan",
    name: "Indigo adire kaftan",
    designer: "Accra tailoring house (sample)",
    gender: "women",
    category: "kaftans",
    price: 9000,
    description: "A floor-length kaftan in hand-dyed indigo cotton, with a solid yoke and tassel.",
    details: ["Hand-dyed cotton", "Wide batwing sleeves", "One size fits UK 8 to 20", "Made in Ghana"],
    sizes: sizes(["One size"], [4]),
    addedAt: "2026-10-15",
    art: { silhouette: "kaftan", pattern: "dye", colors: ["#2A2F8F", "#1A1C5C", "#4B53C2"] },
  },
  {
    slug: "kente-trim-shirt",
    name: "Kente-trim linen shirt",
    designer: "Kumasi atelier (sample)",
    gender: "men",
    category: "shirts",
    price: 6500,
    description: "A long-sleeve linen shirt with a hand-woven kente placket and cuffs.",
    details: ["Linen with kente trim", "Button front", "Made in Ghana"],
    sizes: sizes(MENS, [2, 2, 3, 2, 0]),
    addedAt: "2026-07-30",
    art: { silhouette: "shirt", pattern: "printTrim", colors: ["#F1E6D2", "#E2A31B", "#0E5E3C", "#B5281F", "#141414"] },
  },
  {
    slug: "woven-straw-tote",
    name: "Woven straw tote",
    designer: "Bolgatanga weavers (sample)",
    gender: "unisex",
    category: "bags",
    price: 4200,
    description: "A roomy tote hand-woven from elephant grass, with leather handles.",
    details: ["Hand-woven elephant grass", "Leather handles", "About 40 × 35 cm", "Made in Ghana"],
    sizes: sizes(["One size"], [6]),
    addedAt: "2026-10-01",
    art: { silhouette: "bag", pattern: "stripe", colors: ["#C98B3C", "#8C3B2A", "#EADBC0"] },
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
