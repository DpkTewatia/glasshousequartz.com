import type { Product, SortKey } from './types';

/**
 * Client-safe sorting. Lives outside lib/catalog.ts (which is server-only) so
 * collection pages can render their full product list statically and reorder
 * it in the browser, instead of becoming dynamic routes just to read ?sort=.
 */
export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price, low to high' },
  { value: 'price-desc', label: 'Price, high to low' },
  { value: 'title-asc', label: 'Alphabetical' },
];

export const SORT_KEYS = SORT_OPTIONS.map((o) => o.value);

export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const out = [...products];
  switch (sort) {
    case 'price-asc':
      return out.sort((a, b) => (a.priceMin ?? 0) - (b.priceMin ?? 0));
    case 'price-desc':
      return out.sort((a, b) => (b.priceMin ?? 0) - (a.priceMin ?? 0));
    case 'title-asc':
      return out.sort((a, b) => a.title.localeCompare(b.title));
    case 'newest':
      return out.sort(
        (a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime(),
      );
    default:
      // "Featured" puts in-stock, well-photographed products first — a product
      // with 17 images is one the shop has invested in.
      return out.sort(
        (a, b) =>
          Number(b.available) - Number(a.available) ||
          b.images.length - a.images.length ||
          a.title.localeCompare(b.title),
      );
  }
}
