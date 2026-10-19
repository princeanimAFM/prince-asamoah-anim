import type { Metadata } from "next";
import { Listing } from "@/components/Listing";

export const metadata: Metadata = { title: "Women" };

export default async function Page({ searchParams }: { searchParams: Promise<{ category?: string; sort?: string }> }) {
  return (
    <Listing
      title="Women"
      intro="Dresses, tops, trousers, sandals and accessories from Ghanaian designers."
      basePath="/women"
      filter={{ gender: "women" }}
      searchParams={await searchParams}
    />
  );
}
