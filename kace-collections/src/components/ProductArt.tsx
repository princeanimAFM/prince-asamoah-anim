// Drawn artwork standing in for product photos until real ones arrive:
// the garment's outline filled with its cloth pattern.
import type { PatternKind, Product, Silhouette } from "@/lib/catalogue";

const SHAPES: Record<Silhouette, string> = {
  dress: "M120 50 Q150 82 180 50 L203 66 L238 104 L214 134 L196 118 L252 352 L48 352 L104 118 L86 134 L62 104 L97 66 Z",
  top: "M116 72 Q150 102 184 72 L236 96 L258 162 L222 172 L210 142 L210 248 Q246 286 236 302 L64 302 Q54 286 90 248 L90 142 L78 172 L42 162 L64 96 Z",
  shirt: "M120 60 L150 92 L180 60 L240 84 L266 180 L226 190 L216 140 L216 342 L84 342 L84 140 L74 190 L34 180 L60 84 Z",
  smock: "M126 62 Q150 86 174 62 L250 80 L276 192 L240 202 L232 150 L246 342 L54 342 L68 150 L60 202 L24 192 L50 80 Z",
  trousers: "M86 58 L214 58 L236 352 L170 352 L150 142 L130 352 L64 352 Z",
  shoe: "M42 262 Q40 232 82 226 L120 222 Q150 196 186 206 Q236 214 262 244 Q276 262 260 276 L52 282 Q38 280 42 262 Z",
  bag: "M58 150 L242 150 L258 352 L42 352 Z",
  fabric: "M48 112 L252 92 L252 302 L48 322 Z",
};

function PatternFill({ id, kind, colors }: { id: string; kind: PatternKind; colors: string[] }) {
  const [a, b = a, c = b, d = "#141414"] = colors;
  switch (kind) {
    case "kente":
      return (
        <pattern id={id} width="64" height="64" patternUnits="userSpaceOnUse">
          <rect width="64" height="64" fill={a} />
          {[4, 12, 20].map((y) => <rect key={y} x="0" y={y} width="32" height="4" fill={b} />)}
          {[36, 44, 52].map((x) => <rect key={x} x={x} y="32" width="4" height="32" fill={c} />)}
          <rect x="32" y="0" width="32" height="32" fill={c} />
          <rect x="40" y="8" width="16" height="16" fill={a} />
          <rect x="0" y="40" width="32" height="16" fill={d} />
          <rect x="0" y="46" width="32" height="4" fill={a} />
        </pattern>
      );
    case "wax":
      return (
        <pattern id={id} width="48" height="48" patternUnits="userSpaceOnUse">
          <rect width="48" height="48" fill={c} />
          {[[12, 12], [36, 36]].map(([x, y]) => (
            <g key={x}>
              <circle cx={x} cy={y} r="11" fill={a} />
              <circle cx={x} cy={y} r="5" fill={b} />
            </g>
          ))}
          <circle cx="36" cy="12" r="3" fill={a} />
          <circle cx="12" cy="36" r="3" fill={a} />
        </pattern>
      );
    case "adinkra":
      return (
        <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill={b} />
          <circle cx="20" cy="20" r="9" fill="none" stroke={a} strokeWidth="2.5" />
          <path d="M20 8 V32 M8 20 H32" stroke={a} strokeWidth="2.5" />
          <circle cx="20" cy="20" r="3" fill={b} />
        </pattern>
      );
    case "stripe":
      return (
        <pattern id={id} width="36" height="36" patternUnits="userSpaceOnUse">
          <rect width="36" height="36" fill={c} />
          <rect x="0" width="12" height="36" fill={a} />
          <rect x="16" width="4" height="36" fill={b} />
          <rect x="0" y="0" width="36" height="2" fill={b} opacity="0.35" />
        </pattern>
      );
    case "solid":
      return (
        <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill={a} />
          <path d="M0 8 L8 0" stroke="#ffffff" strokeOpacity="0.08" />
        </pattern>
      );
  }
}

export function ProductArt({ product, className }: { product: Product; className?: string }) {
  const { silhouette, pattern, colors } = product.art;
  const id = `cloth-${product.slug}`;
  return (
    <svg viewBox="0 0 300 400" className={className} role="img" aria-label={`${product.name} (illustration)`}>
      <defs>
        <PatternFill id={id} kind={pattern} colors={colors} />
      </defs>
      <rect width="300" height="400" fill="var(--color-sand)" />
      <ellipse cx="150" cy="372" rx="110" ry="9" fill="#000" opacity="0.06" />
      {silhouette === "bag" && (
        <path d="M100 152 Q100 72 150 72 Q200 72 200 152" fill="none" stroke="#5a3a24" strokeWidth="10" strokeLinecap="round" />
      )}
      <path d={SHAPES[silhouette]} fill={`url(#${id})`} stroke="#000" strokeOpacity="0.18" strokeWidth="1.5" strokeLinejoin="round" />
      {silhouette === "fabric" && <path d="M48 160 L252 140" stroke="#000" strokeOpacity="0.18" strokeWidth="2" />}
      {silhouette === "shoe" && <path d="M118 224 Q150 250 190 210" fill="none" stroke="#000" strokeOpacity="0.25" strokeWidth="6" />}
    </svg>
  );
}
