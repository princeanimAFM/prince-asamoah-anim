import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  /** Sizing classes for the frame, e.g. "aspect-[3/4] w-full". The photo fills and crops to it. */
  className?: string;
  /** How wide the photo shows at each screen size, so the browser picks the right file. */
  sizes: string;
  priority?: boolean;
  /** Where to keep the focus when cropping, as CSS object-position. */
  focus?: string;
};

// A photo in a fixed frame, served sharp and light by next/image.
export function Photo({ src, alt, className = "", sizes, priority, focus = "center" }: Props) {
  return (
    <span className={`relative block overflow-hidden bg-sand ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} quality={85} priority={priority} className="object-cover" style={{ objectPosition: focus }} />
    </span>
  );
}
