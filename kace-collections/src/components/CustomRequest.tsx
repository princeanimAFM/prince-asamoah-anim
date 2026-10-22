"use client";
// The part of the custom order page that depends on what the customer picked (a look or a
// made-to-order piece), read from the address bar in the browser.
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getProduct } from "@/lib/catalogue";
import { getLook } from "@/lib/lookbook";
import { SITE } from "@/lib/site";
import { Photo } from "./Photo";

function useRequest() {
  const params = useSearchParams();
  const look = getLook(params.get("look") ?? undefined);
  const found = getProduct(params.get("product") ?? "");
  const product = found?.availability === "made-to-order" ? found : undefined;
  // Only accept a size the product is actually made in.
  const size = product ? product.sizes.find((s) => s.label === params.get("size"))?.label : undefined;
  const message = product
    ? `Hi KACE, I'd like to order the ${product.name}${size ? ` in size ${size}` : ""}, made to order.`
    : look
      ? `Hi KACE, I'd like the "${look.title}" look from your Lookbook made for me.`
      : "Hi KACE, I'd like something made for me.";

  return { look, product, size, message };
}

export function RequestSummary() {
  const { look, product, size } = useRequest();
  return (
    <>
      {product && (
        <div className="mt-8 flex items-center gap-4 border border-line p-4">
          <Photo src={product.photo.src} alt="" className="h-24 w-16 shrink-0" sizes="64px" />
          <p>
            You&apos;re asking about the <strong>{product.name}</strong>{size && <> in size <strong>{size}</strong></>}
            {product.makingTime && <>, usually ready in about {product.makingTime}</>}.{" "}
            <Link href={`/products/${product.slug}`} className="underline underline-offset-4">See the piece</Link>
          </p>
        </div>
      )}

      {!product && look && (
        <div className="mt-8 flex items-center gap-4 border border-line p-4">
          <Photo src={look.photos[0].src} alt="" className="h-24 w-16 shrink-0" sizes="64px" />
          <p>
            You&apos;re asking about <strong>{look.title}</strong>.{" "}
            <Link href={`/lookbook#${look.slug}`} className="underline underline-offset-4">See the look</Link>
          </p>
        </div>
      )}

    </>
  );
}

export function StartOrderButton() {
  const { message } = useRequest();
  const wa = SITE.whatsapp.replace(/[^\d]/g, "");
  return wa ? (
    <a href={`https://wa.me/${wa}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer"
      className="inline-block bg-ink px-7 py-4 font-semibold text-paper hover:bg-forest">
      Message us on WhatsApp
    </a>
  ) : (
    <Link href="/contact" className="inline-block bg-ink px-7 py-4 font-semibold text-paper hover:bg-forest">Contact us</Link>
  );
}
