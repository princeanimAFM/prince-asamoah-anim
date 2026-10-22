import type { Product } from "@/lib/catalogue";
import { Photo } from "./Photo";

const CARD_SIZES = "(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 50vw";

export function ProductImage({ product, className = "", sizes = CARD_SIZES, priority }: { product: Product; className?: string; sizes?: string; priority?: boolean }) {
  return <Photo src={product.photo.src} alt={product.photo.alt} className={className} sizes={sizes} priority={priority} />;
}
