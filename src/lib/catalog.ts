import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { cache } from 'react';
import { isReachable, query } from './db';
import type { Catalog, Collection, Product } from './types';

// Sorting is shared with the client (collection pages reorder in the browser).
export { sortProducts, SORT_OPTIONS, SORT_KEYS } from './sort';

/**
 * Catalog access.
 *
 * Reads from MySQL when DATABASE_URL points at a reachable server, and falls
 * back to the generated data/catalog.json otherwise. The fallback is not a
 * mock — it is the exact same data the seeder loads — so the storefront is
 * fully browsable on a clean checkout before anyone provisions a database.
 *
 * The catalog is 118 products / 339 variants, so it is assembled once per
 * request and filtered in memory. `cache()` dedupes that across every
 * component in a single render pass.
 */

/**
 * Read from disk rather than `import`ed, deliberately: a static JSON import of
 * this size forces TypeScript to infer a literal type for every one of the 118
 * products, which makes type-checking crawl. next.config.ts keeps the file in
 * the server bundle via outputFileTracingIncludes.
 */
let fallbackCache: Catalog | null = null;

function loadFallback(): Catalog {
  if (!fallbackCache) {
    const file = path.join(process.cwd(), 'data', 'catalog.json');
    fallbackCache = JSON.parse(fs.readFileSync(file, 'utf8')) as Catalog;
  }
  return fallbackCache;
}

interface ProductRow {
  handle: string;
  title: string;
  brand: string;
  description: string | null;
  description_html: string | null;
  price_min: number | null;
  price_max: number | null;
  available: number;
  published_at: string | null;
}

async function loadFromDb(): Promise<Catalog> {
  const [products, images, options, variants, links, tags, collections] = await Promise.all([
    query<ProductRow>(
      `SELECT handle, title, brand, description, description_html,
              price_min, price_max, available, published_at
         FROM products`,
    ),
    query<{ product_handle: string; src: string; alt: string | null; width: number | null; height: number | null; position: number }>(
      `SELECT product_handle, src, alt, width, height, position
         FROM product_images ORDER BY product_handle, position`,
    ),
    query<{ product_handle: string; name: string; values_json: string | string[]; position: number }>(
      `SELECT product_handle, name, values_json, position
         FROM product_options ORDER BY product_handle, position`,
    ),
    query<{ id: string; product_handle: string; sku: string | null; title: string; price: number; compare_at_price: number | null; available: number; option1: string | null; option2: string | null; option3: string | null; position: number }>(
      `SELECT id, product_handle, sku, title, price, compare_at_price, available,
              option1, option2, option3, position
         FROM product_variants ORDER BY product_handle, position`,
    ),
    query<{ product_handle: string; collection_handle: string; position: number }>(
      `SELECT product_handle, collection_handle, position
         FROM product_collections ORDER BY collection_handle, position`,
    ),
    query<{ product_handle: string; tag: string }>(`SELECT product_handle, tag FROM product_tags`),
    query<{ handle: string; title: string; group: string; description: string | null; image: string | null; sort_order: number; product_count: number }>(
      `SELECT handle, title, \`group\`, description, image, sort_order, product_count
         FROM collections ORDER BY sort_order`,
    ),
  ]);

  const byHandle = new Map<string, Product>();
  for (const r of products) {
    byHandle.set(r.handle, {
      handle: r.handle,
      title: r.title,
      brand: r.brand,
      description: r.description ?? '',
      descriptionHtml: r.description_html ?? '',
      images: [],
      options: [],
      variants: [],
      priceMin: r.price_min,
      priceMax: r.price_max,
      available: Boolean(r.available),
      tags: [],
      publishedAt: r.published_at,
      collections: [],
    });
  }

  for (const i of images) {
    byHandle.get(i.product_handle)?.images.push({
      src: i.src,
      alt: i.alt ?? '',
      width: i.width,
      height: i.height,
      position: i.position,
    });
  }
  for (const o of options) {
    const values = typeof o.values_json === 'string' ? JSON.parse(o.values_json) : o.values_json;
    byHandle.get(o.product_handle)?.options.push({ name: o.name, values });
  }
  for (const v of variants) {
    byHandle.get(v.product_handle)?.variants.push({
      id: v.id,
      sku: v.sku,
      title: v.title,
      price: v.price,
      compareAtPrice: v.compare_at_price,
      available: Boolean(v.available),
      option1: v.option1,
      option2: v.option2,
      option3: v.option3,
      position: v.position,
    });
  }
  for (const t of tags) byHandle.get(t.product_handle)?.tags.push(t.tag);

  const membership = new Map<string, string[]>();
  for (const l of links) {
    byHandle.get(l.product_handle)?.collections.push(l.collection_handle);
    if (!membership.has(l.collection_handle)) membership.set(l.collection_handle, []);
    membership.get(l.collection_handle)!.push(l.product_handle);
  }

  const all = [...byHandle.values()];
  return {
    generatedAt: new Date().toISOString(),
    source: 'mysql',
    counts: {
      products: all.length,
      collections: collections.length,
      variants: all.reduce((n, p) => n + p.variants.length, 0),
      images: all.reduce((n, p) => n + p.images.length, 0),
      orphans: all.filter((p) => p.collections.length === 0).length,
    },
    collections: collections.map((c) => ({
      handle: c.handle,
      title: c.title,
      group: c.group,
      description: c.description ?? '',
      image: c.image,
      productHandles: membership.get(c.handle) ?? [],
      count: c.product_count,
      sortOrder: c.sort_order,
    })),
    products: all,
  };
}

export const getCatalog = cache(async (): Promise<Catalog> => {
  if (await isReachable()) {
    try {
      const fromDb = await loadFromDb();
      if (fromDb.products.length > 0) return fromDb;
      console.warn('[catalog] MySQL reachable but empty — run `npm run db:seed`. Serving data/catalog.json.');
    } catch (err) {
      console.error('[catalog] MySQL read failed, serving data/catalog.json:', err);
    }
  }
  return loadFallback();
});

/* ------------------------------------------------------------------ *
 * Queries
 * ------------------------------------------------------------------ */

export const getAllProducts = cache(async (): Promise<Product[]> => (await getCatalog()).products);

export const getCollections = cache(async (): Promise<Collection[]> =>
  [...(await getCatalog()).collections].sort((a, b) => a.sortOrder - b.sortOrder),
);

/**
 * Collections only store an image URL, not its dimensions. Their image is
 * always one of a product's photos, so the shape can be looked up from there.
 */
export const getImageAspects = cache(async (): Promise<Map<string, number>> => {
  const { products } = await getCatalog();
  const aspects = new Map<string, number>();
  for (const p of products) {
    for (const i of p.images) {
      if (i.width && i.height) aspects.set(i.src, i.width / i.height);
    }
  }
  return aspects;
});

export const getProduct = cache(async (handle: string): Promise<Product | null> => {
  const { products } = await getCatalog();
  return products.find((p) => p.handle === handle) ?? null;
});

export const getCollection = cache(async (handle: string): Promise<Collection | null> => {
  const { collections } = await getCatalog();
  return collections.find((c) => c.handle === handle) ?? null;
});

export const getProductsInCollection = cache(async (handle: string): Promise<Product[]> => {
  const { products } = await getCatalog();
  return products.filter((p) => p.collections.includes(handle));
});

/** Collections grouped for navigation, in declared order. */
export const getNavigation = cache(async (): Promise<{ group: string; collections: Collection[] }[]> => {
  const collections = await getCollections();
  const groups: { group: string; collections: Collection[] }[] = [];
  for (const c of collections) {
    if (c.handle === 'glasshouse' || c.handle === 'cookies') continue; // surfaced as top-level links
    let g = groups.find((x) => x.group === c.group);
    if (!g) groups.push((g = { group: c.group, collections: [] }));
    g.collections.push(c);
  }
  return groups;
});

export const searchProducts = cache(async (q: string): Promise<Product[]> => {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const terms = needle.split(/\s+/).filter(Boolean);
  const { products } = await getCatalog();

  return products
    .map((p) => {
      const title = p.title.toLowerCase();
      const haystack = `${title} ${p.brand} ${p.tags.join(' ')} ${p.description}`.toLowerCase();
      let score = 0;
      for (const t of terms) {
        if (!haystack.includes(t)) return { p, score: -1 };
        if (title.startsWith(t)) score += 4;
        else if (title.includes(t)) score += 3;
        else score += 1;
      }
      return { p, score };
    })
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score || a.p.title.localeCompare(b.p.title))
    .map((x) => x.p);
});

/** Same collection first, then same brand. Never returns the product itself. */
export const getRelatedProducts = cache(async (handle: string, limit = 4): Promise<Product[]> => {
  const { products } = await getCatalog();
  const product = products.find((p) => p.handle === handle);
  if (!product) return [];

  const scored = products
    .filter((p) => p.handle !== handle)
    .map((p) => {
      const shared = p.collections.filter((c) => product.collections.includes(c)).length;
      const sameBrand = p.brand === product.brand ? 1 : 0;
      return { p, score: shared * 3 + sameBrand + (p.images.length > 3 ? 1 : 0) };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((x) => x.p);
});

export const getVariant = cache(async (variantId: string) => {
  const { products } = await getCatalog();
  for (const p of products) {
    const v = p.variants.find((x) => x.id === variantId);
    if (v) return { product: p, variant: v };
  }
  return null;
});
