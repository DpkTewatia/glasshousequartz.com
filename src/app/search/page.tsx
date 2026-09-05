import type { Metadata } from 'next';
import Link from 'next/link';
import ProductGrid from '@/components/commerce/ProductGrid';
import { getCollections, searchProducts } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = '' } = await searchParams;
  const query = q.trim();
  const [results, collections] = await Promise.all([
    query ? searchProducts(query) : Promise.resolve([]),
    getCollections(),
  ]);

  return (
    <div className="u-container py-12 md:py-16">
      <p className="u-label">Search</p>

      <form action="/search" method="get" className="mt-5 max-w-2xl">
        <label htmlFor="q" className="sr-only">
          Search products
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="What are you looking for?"
          className="field !border-b-2 !py-4 font-display text-3xl md:text-4xl"
        />
      </form>

      {query ? (
        <>
          <p className="mt-6 text-sm text-ink-500">
            {results.length} {results.length === 1 ? 'result' : 'results'} for{' '}
            <span className="text-ink">“{query}”</span>
          </p>

          {results.length > 0 ? (
            <div className="mt-12">
              <ProductGrid products={results} />
            </div>
          ) : (
            <div className="mt-16 border-t border-line pt-12">
              <h2 className="font-display text-display-sm">Nothing matched that.</h2>
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-500">
                Try a broader term, or browse a collection instead.
              </p>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {collections.slice(0, 10).map((c) => (
                  <li key={c.handle}>
                    <Link href={`/collections/${c.handle}`} className="link-draw text-sm text-ink-700">
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className="mt-16 border-t border-line pt-12">
          <h2 className="u-label">Browse instead</h2>
          <ul className="mt-8 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c) => (
              <li key={c.handle}>
                <Link
                  href={`/collections/${c.handle}`}
                  className="group flex items-baseline justify-between gap-6 border-b border-line py-3.5"
                >
                  <span className="text-[0.9375rem] transition-opacity group-hover:opacity-60">
                    {c.title}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-ink-400">{c.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
