import type { Metadata } from "next";
import { Listing } from "@/components/Listing";

export const metadata: Metadata = { title: "Men" };

export default async function Page({ searchParams }: { searchParams: Promise<{ category?: string; sort?: string }> }) {
  return (
    <Listing
      title="Men"
      intro="Smocks, shirts, tailoring and leather slides from Ghanaian designers."
      basePath="/men"
      filter={{ gender: "men" }}
      searchParams={await searchParams}
    />
  );
}
