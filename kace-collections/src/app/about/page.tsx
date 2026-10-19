import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/Prose";

export const metadata: Metadata = { title: "About" };

export default function About() {
  return (
    <div className="gutter mx-auto max-w-7xl">
      <PageHeader title="About KACE" intro="Ghanaian craft, brought to wherever you are." />
      <div className="grid gap-12 py-12 md:grid-cols-[1fr_1.4fr]">
        <p className="display text-3xl leading-tight md:text-4xl">
          Every piece we sell is made by a designer, tailor or weaver in Ghana.
        </p>
        <div className="max-w-prose space-y-5 text-lg">
          <p>
            KACE COLLECTIONS started with a simple idea: the best of Ghanaian fashion should be easy to buy, whether
            you live in London, Manchester, Accra or Kumasi.
          </p>
          <p>
            We work directly with independent makers: kente weavers, wax print tailors, smock makers from the north,
            and leather workers. When you place an order, we buy the piece from its maker, check it by hand, and send
            it to you with tracking.
          </p>
          <p>
            Buying directly means the makers are paid fairly for their work, and you get pieces you won&apos;t find on
            the high street.
          </p>
          <p className="text-base text-muted">
            [Draft story. The owner will replace this with his own words.]
          </p>
          <Link href="/new-arrivals" className="inline-block bg-ink px-6 py-3 text-base font-semibold text-paper">See the latest pieces</Link>
        </div>
      </div>
    </div>
  );
}
