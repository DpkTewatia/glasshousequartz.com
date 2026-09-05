import type { MetadataRoute } from 'next';
import { getAllProducts, getCollections } from '@/lib/catalog';
import { PAGES } from '@/lib/pages';
import { SITE } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections] = await Promise.all([getAllProducts(), getCollections()]);
  const now = new Date();

  return [
    { url: SITE.url, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    {
      url: `${SITE.url}/collections`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...collections.map((c) => ({
      url: `${SITE.url}/collections/${c.handle}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${SITE.url}/products/${p.handle}`,
      lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...PAGES.filter((p) => !p.noindex).map((p) => ({
      url: `${SITE.url}/pages/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    })),
  ];
}
