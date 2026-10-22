import { PageHeader } from "./Prose";

export type LegalSection = { heading: string; body: React.ReactNode };

// Shared layout for the terms of sale and privacy notice.
export function LegalPage({ title, updated, intro, sections }: { title: string; updated: string; intro: React.ReactNode; sections: LegalSection[] }) {
  return (
    <div className="gutter mx-auto max-w-7xl">
      <PageHeader title={title} />
      <div className="max-w-prose space-y-8 py-10">
        <p className="text-sm text-muted">Last updated {updated}</p>
        <div className="space-y-3 text-lg">{intro}</div>
        {sections.map((s, i) => (
          <section key={s.heading} className="space-y-3">
            <h2 className="text-xl font-semibold">{i + 1}. {s.heading}</h2>
            <div className="space-y-3 text-muted [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink">{s.body}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
