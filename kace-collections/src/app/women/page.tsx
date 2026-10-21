import type { Metadata } from "next";
import { Listing } from "@/components/Listing";

export const metadata: Metadata = { title: "Women" };

export default async function Page({ searchParams }: { searchParams: Promise<{ category?: string | string[]; sort?: string | string[]; availability?: string | string[] }> }) {
  return (
    <Listing
      title="Women"
      intro="Patchwork, denim and sets from Ghanaian designers, ready to send or made for you."
      basePath="/women"
      filter={{ gender: "women" }}
      searchParams={await searchParams}
    />
  );
}
