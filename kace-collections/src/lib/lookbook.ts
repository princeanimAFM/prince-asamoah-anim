// Looks from KACE's own photoshoots. Each one can be bought piece by piece (when the pieces
// are in the shop) or requested as a made-to-order version.

export type LookPhoto = { src: string; alt: string; credit?: string };

export type Look = {
  slug: string;
  title: string;
  /** How the look is put together, in the owner's words. */
  story: string;
  /** What's being worn, for customers asking for something similar. */
  wearing: string[];
  /** Shop products in the photos, by slug. */
  products: string[];
  /** The first photo is the main one. */
  photos: LookPhoto[];
};

const ELLIS = "Ellis Photography";

// Draft descriptions: the owner will replace them in his own words.
export const LOOKS: Look[] = [
  {
    slug: "patchwork-weekend",
    title: "Patchwork weekend",
    story: "Kwadwo Man's patchwork corduroy, worn as a full set. Keep everything else simple: a white tee, a black beanie and clean trainers.",
    wearing: ["Patchwork corduroy jacket and trousers by Kwadwo Man", "White T-shirt", "Black beanie", "White trainers"],
    products: ["patchwork-corduroy-set"],
    photos: [
      { src: "/lookbook/patchwork-weekend.jpg", alt: "A man in a mustard, orange and black patchwork corduroy jacket and matching patchwork trousers at an outdoor festival" },
    ],
  },
  {
    slug: "city-casual",
    title: "City casual",
    story: "Soft neutrals for a summer day in town: a cream ribbed knit, pale denim shorts, white socks and burgundy loafers, with a tweed cap to finish.",
    wearing: ["Cream ribbed crew-neck knit", "Light-wash denim shorts", "Brown tweed flat cap", "Burgundy leather loafers", "Tan studded holdall"],
    products: [],
    photos: [
      { src: "/lookbook/city-casual-3.jpg", alt: "A man in a cream knit, light denim shorts, white socks and burgundy loafers, leaning against a stone wall" },
      { src: "/lookbook/city-casual.jpg", alt: "Close-up of a cream ribbed knit and brown tweed flat cap" },
      { src: "/lookbook/city-casual-2.jpg", alt: "Crouching in a cream knit and denim shorts beside a tan studded holdall" },
    ],
  },
  {
    slug: "cream-and-black",
    title: "Cream and black",
    story: "The same cream knit, dressed up with wide pleated black trousers, a leather belt, a wallet chain and square-toe boots.",
    wearing: ["Cream ribbed crew-neck knit", "Wide-leg pleated black trousers", "Black leather belt and wallet chain", "Square-toe black boots", "Brown tweed flat cap"],
    products: [],
    photos: [
      { src: "/lookbook/cream-and-black.jpg", alt: "A man in a cream knit and wide black trousers, sitting against a steel pillar" },
    ],
  },
  {
    slug: "sharp-commute",
    title: "Sharp commute",
    story: "Office dressing with an edge: a navy bomber over a white shirt and skinny tie, wide black trousers and a pearl wallet chain.",
    wearing: ["Navy bomber jacket", "White shirt and slim grey tie", "Wide-leg black trousers", "Pearl wallet chain", "Square-toe black boots", "Black leather tote"],
    products: [],
    photos: [
      { src: "/lookbook/sharp-commute.jpg", alt: "A man walking by the water in a navy bomber, white shirt, tie and wide black trousers, carrying a black tote", credit: ELLIS },
      { src: "/lookbook/sharp-commute-2.jpg", alt: "Adjusting clear glasses in a navy bomber and wide black trousers with a pearl chain", credit: ELLIS },
    ],
  },
  {
    slug: "autumn-layers",
    title: "Autumn layers",
    story: "Deep colours for cooler days: a burgundy ribbed polo knit with a printed neckerchief, black beret and wide trousers.",
    wearing: ["Burgundy ribbed zip-neck knit", "Printed neckerchief", "Black beret", "Wide-leg black trousers", "Black loafers", "Small crossbody bag"],
    products: [],
    photos: [
      { src: "/lookbook/autumn-layers.jpg", alt: "A man in a black beret, burgundy knit, printed neckerchief and wide black trousers, leaning on a wall" },
    ],
  },
];

export function getLook(slug: unknown, looks: Look[] = LOOKS): Look | undefined {
  return typeof slug === "string" ? looks.find((l) => l.slug === slug) : undefined;
}
