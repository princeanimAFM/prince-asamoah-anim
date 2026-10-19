// Drawn artwork standing in for product photos until real ones arrive:
// the garment's outline filled with its cloth.
import type { PatternKind, Product, Silhouette } from "@/lib/catalogue";

const SHAPES: Record<Silhouette, string> = {
  dress: "M116 56 Q150 80 184 56 L236 76 L262 158 L226 168 L214 132 L230 352 L70 352 L86 132 L74 168 L38 158 L64 76 Z",
  kaftan: "M128 34 Q150 54 172 34 L292 62 L292 168 L246 214 L252 372 L48 372 L54 214 L8 168 L8 62 Z",
  tunicSet: "M120 42 Q150 66 180 42 L234 62 L260 150 L226 160 L214 124 L218 252 L208 252 L212 368 L164 368 L152 254 L148 254 L136 368 L88 368 L92 252 L82 252 L86 124 L74 160 L40 150 L66 62 Z",
  set: "M118 40 L150 64 L182 40 L240 62 L262 140 L226 148 L216 116 L216 182 L84 182 L84 116 L74 148 L38 140 L60 62 Z M88 192 L212 192 L236 370 L168 370 L150 236 L132 370 L64 370 Z",
  jacket: "M118 66 L150 96 L182 66 L246 90 L274 268 L236 276 L222 170 L222 300 L78 300 L78 170 L64 276 L26 268 L54 90 Z",
  shirt: "M120 60 L150 92 L180 60 L240 84 L266 180 L226 190 L216 140 L216 342 L84 342 L84 140 L74 190 L34 180 L60 84 Z",
  trousers: "M86 52 L214 52 L240 360 L170 360 L150 140 L130 360 L60 360 Z",
  bag: "M58 150 L242 150 L258 352 L42 352 Z",
};

// Small deterministic number generator so each product's patchwork is the same on every render.
function seeded(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h >>> 0) % 1000) / 1000;
  };
}

function Patchwork({ id, colors }: { id: string; colors: string[] }) {
  const rand = seeded(id);
  const blocks: React.ReactNode[] = [];
  let y = 0;
  while (y < 400) {
    const h = 30 + Math.floor(rand() * 50);
    let x = 0;
    while (x < 300) {
      const w = 34 + Math.floor(rand() * 60);
      const fill = colors[Math.floor(rand() * colors.length)];
      blocks.push(<rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} fill={fill} stroke="#000" strokeOpacity="0.25" />);
      if (rand() > 0.82) blocks.push(<rect key={`p${x}-${y}`} x={x + 8} y={y + 6} width={Math.min(28, w - 12)} height={Math.min(26, h - 10)} fill="none" stroke="#000" strokeOpacity="0.3" strokeDasharray="3 2" />);
      x += w;
    }
    y += h;
  }
  return (
    <g>
      {blocks}
      <rect width="300" height="400" fill={`url(#${id}-rib)`} />
    </g>
  );
}

function Fill({ id, kind, colors }: { id: string; kind: PatternKind; colors: string[] }) {
  const [a, b = a, c = b] = colors;
  switch (kind) {
    case "patchwork":
      return <Patchwork id={id} colors={colors} />;
    case "denim":
      return (
        <g>
          <rect width="300" height="400" fill={a} />
          <rect width="300" height="400" fill={`url(#${id}-twill)`} />
        </g>
      );
    case "leather":
      return (
        <g>
          <rect width="300" height="400" fill={a} />
          <rect width="300" height="400" fill={`url(#${id}-sheen)`} />
        </g>
      );
    case "dye":
      return (
        <g>
          <rect width="300" height="400" fill={a} />
          {Array.from({ length: 26 }, (_, i) => {
            const r = seeded(`${id}${i}`);
            return <ellipse key={i} cx={r() * 300} cy={r() * 400} rx={10 + r() * 30} ry={6 + r() * 18} fill={i % 2 ? b : c} opacity="0.55" />;
          })}
        </g>
      );
    case "stripe":
      return (
        <g>
          <rect width="300" height="400" fill={c} />
          <rect width="300" height="400" fill={`url(#${id}-stripe)`} />
        </g>
      );
    case "printTrim":
      return (
        <g>
          <rect width="300" height="400" fill={a} />
          <rect x="140" y="0" width="20" height="400" fill={`url(#${id}-trim)`} />
          <rect x="176" y="120" width="30" height="30" fill={`url(#${id}-trim)`} />
        </g>
      );
    case "solid":
      return <rect width="300" height="400" fill={a} />;
  }
}

export function ProductArt({ product, className }: { product: Product; className?: string }) {
  const { silhouette, pattern, colors } = product.art;
  const id = `cloth-${product.slug}`;
  const [a, b = a, c = b, d = "#141414", e = c] = colors;
  const isSet = silhouette === "set" || silhouette === "tunicSet";
  return (
    <svg viewBox="0 0 300 400" className={className} role="img" aria-label={`${product.name} (illustration)`}>
      <defs>
        <clipPath id={`${id}-clip`}><path d={SHAPES[silhouette]} /></clipPath>
        <pattern id={`${id}-rib`} width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M0 0 V4" stroke="#000" strokeOpacity="0.08" strokeWidth="1.5" />
        </pattern>
        <pattern id={`${id}-twill`} width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 6 L6 0" stroke="#fff" strokeOpacity="0.12" />
        </pattern>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.25" />
        </linearGradient>
        <pattern id={`${id}-stripe`} width="40" height="40" patternUnits="userSpaceOnUse">
          <rect x="0" width="10" height="40" fill={a} />
          <rect x="14" width="4" height="40" fill={b} />
        </pattern>
        <pattern id={`${id}-trim`} width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill={b} />
          <path d="M0 10 L10 0 L20 10 L10 20 Z" fill={c} />
          <rect x="7" y="7" width="6" height="6" fill={d} />
          <rect x="0" y="0" width="4" height="4" fill={e} />
        </pattern>
      </defs>
      <rect width="300" height="400" fill="var(--color-sand)" />
      <ellipse cx="150" cy="378" rx="110" ry="8" fill="#000" opacity="0.06" />
      {silhouette === "bag" && (
        <path d="M100 152 Q100 72 150 72 Q200 72 200 152" fill="none" stroke="#5a3a24" strokeWidth="10" strokeLinecap="round" />
      )}
      <g clipPath={`url(#${id}-clip)`}>
        <Fill id={id} kind={pattern} colors={colors} />
        {pattern === "denim" && <path d={SHAPES[silhouette]} fill="none" stroke={c} strokeWidth="5" strokeDasharray="4 4" strokeOpacity="0.8" />}
        {silhouette === "jacket" && <path d="M150 96 V300" stroke="#000" strokeOpacity="0.35" strokeWidth="3" />}
        {isSet && silhouette === "set" && <path d="M150 64 V182" stroke="#000" strokeOpacity="0.3" strokeWidth="2" />}
      </g>
      <path d={SHAPES[silhouette]} fill="none" stroke="#000" strokeOpacity="0.22" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
