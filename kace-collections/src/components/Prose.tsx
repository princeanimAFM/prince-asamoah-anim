export function PageHeader({ title, intro }: { title: string; intro?: string }) {
  return (
    <header className="border-b border-line py-10 md:py-14">
      <h1 className="display text-5xl md:text-7xl">{title}</h1>
      {intro && <p className="mt-3 max-w-xl text-lg text-muted">{intro}</p>}
    </header>
  );
}

