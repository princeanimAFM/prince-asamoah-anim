import type { Metadata } from "next";
import { Suspense } from "react";
import { Listing } from "@/components/Listing";

export const metadata: Metadata = { title: "Men" };

export default function Page() {
  return (
    <Suspense>
      <Listing title="Men" intro="Patchwork, denim and sets from Ghanaian designers, ready to send or made for you." basePath="/men" filter={{ gender: "men" }} />
    </Suspense>
  );
}
