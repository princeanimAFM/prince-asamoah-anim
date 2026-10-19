import type { Metadata } from "next";
import { Listing } from "@/components/Listing";

export const metadata: Metadata = { title: "Sale" };

export default async function Page({ searchParams }: { searchParams: Promise<{ category?: string; sort?: string }> }) {
  return (
    <Listing
      title="Sale"
      intro="Reduced pieces while stock lasts."
      basePath="/sale"
      filter={{ sale: true }}
      searchParams={await searchParams}
    />
  );
}
