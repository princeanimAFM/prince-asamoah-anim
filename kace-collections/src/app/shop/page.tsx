import type { Metadata } from "next";
import { Suspense } from "react";
import { Listing } from "@/components/Listing";

export const metadata: Metadata = { title: "Shop all" };

export default function Page() {
  return (
    <Suspense>
      <Listing title="Shop all" intro="Pieces in stock and ready to send, and pieces made to order for you by our designers in Ghana." basePath="/shop" filter={{}} />
    </Suspense>
  );
}
