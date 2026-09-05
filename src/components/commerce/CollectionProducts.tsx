'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import ProductGrid from './ProductGrid';
import { SORT_OPTIONS, sortProducts } from '@/lib/sort';
import type { Product, SortKey } from '@/lib/types';

/**
 * Collection listing with sorting.
 *
 * Sorting happens in the browser rather than as a server round trip, which is
 * what allows the collection page itself to be statically prerendered. The
 * chosen order is still reflected in the URL (via replaceState) so a sorted
 * view can be copied and shared, but reading it never makes the route dynamic.
 */
export default function CollectionProducts({ products }: { products: Product[] }) {
  // useSearchParams rather than reading window.location in an effect: it is
  // empty during the prerender and populated on the client, so a shared
  // "?sort=price-asc" link still opens in that order without the server ever
  // having to read the query string.
  const params = useSearchParams();
  const fromUrl = params.get('sort');
  const urlSort = SORT_OPTIONS.some((o) => o.value === fromUrl) ? (fromUrl as SortKey) : null;

  const [override, setOverride] = useState<SortKey | null>(null);
  const sort: SortKey = override ?? urlSort ?? 'featured';

  const sorted = useMemo(() => sortProducts(products, sort), [products, sort]);

  const change = (next: SortKey) => {
    setOverride(next);
    const url = new URL(window.location.href);
    if (next === 'featured') url.searchParams.delete('sort');
    else url.searchParams.set('sort', next);
    // replaceState, not a router push: reordering a list the browser already
    // has should not add a history entry or refetch the page.
    window.history.replaceState(null, '', url.toString());
  };

  return (
    <>
      <div className="flex shrink-0 items-center gap-8">
        <p className="text-xs tabular-nums text-ink-400">
          {products.length} {products.length === 1 ? 'piece' : 'pieces'}
        </p>

        <div className="flex items-center gap-3">
          <label htmlFor="sort" className="u-label">
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => change(e.target.value as SortKey)}
            className="cursor-pointer border-0 border-b border-line bg-transparent py-1 pr-6 text-sm
                       text-ink focus:border-ink focus:outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-12">
        <ProductGrid products={sorted} />
      </div>
    </>
  );
}
