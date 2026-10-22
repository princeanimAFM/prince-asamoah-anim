import Link from "next/link";

export default function NotFound() {
  return (
    <div className="gutter mx-auto max-w-7xl py-24 text-center">
      <p className="display text-6xl">Not found</p>
      <p className="mt-3 text-muted">That page or piece isn&apos;t here. It may have sold out or moved.</p>
      <Link href="/" className="mt-8 inline-block bg-ink px-6 py-3 font-semibold text-paper">Back to the shop</Link>
    </div>
  );
}
