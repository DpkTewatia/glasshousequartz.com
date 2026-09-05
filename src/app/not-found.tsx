import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="u-container flex min-h-[60vh] flex-col items-center justify-center py-band text-center">
      <p className="u-label">404</p>
      <h1 className="mt-6 font-display text-display-lg">We could not find that.</h1>
      <p className="mt-4 max-w-[40ch] text-[0.9375rem] leading-relaxed text-ink-500">
        The page may have moved when we rebuilt the store. Everything is still here — start from a
        collection.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-4">
        <Link href="/collections" className="btn-ink">
          All collections
        </Link>
        <Link href="/" className="btn-outline">
          Home
        </Link>
      </div>
    </div>
  );
}
