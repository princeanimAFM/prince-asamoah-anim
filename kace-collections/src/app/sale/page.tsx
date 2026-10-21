import type { Metadata } from "next";
import { Suspense } from "react";
import { Listing } from "@/components/Listing";

export const metadata: Metadata = { title: "Sale" };

export default function Page() {
  return (
    <Suspense>
      <Listing title="Sale" intro="Reduced pieces while stock lasts." basePath="/sale" filter={{ sale: true }} />
    </Suspense>
  );
}
