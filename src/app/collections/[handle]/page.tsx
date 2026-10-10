import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CollectionProducts from '@/components/commerce/CollectionProducts';
import ProductGrid from '@/components/commerce/ProductGrid';
import { getCollection, getCollections, getProductsInCollection, sortProducts } from '@/lib/catalog';

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map((c) => ({ handle: c.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollection(handle);
  if (!collection) return {};

  const description =
    collection.description ||
    `Shop ${collection.count} ${collection.title.toLowerCase()} from Glasshouse Quartz.`;

  return {
    title: collection.title,
    description,
    alternates: { canonical: `/collections/${handle}` },
    openGraph: {
      title: `${collection.title} — Glasshouse Quartz`,
      description,
      url: `/collections/${handle}`,
      images: collection.image ? [{ url: collection.image }] : undefined,
    },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const collection = await getCollection(handle);
  if (!collection) notFound();

  // Pre-sorted on the server so the static HTML is already in a sensible
  // order; the client component only reorders it if the visitor asks.
  const products = sortProducts(await getProductsInCollection(handle), 'featured');

  return (
    <>
      {/* Header */}
      <section className="border-b border-line">
        <div className="u-container py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-xs text-ink-400">
              <li>
                <Link href="/" className="link-draw">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/collections" className="link-draw">
                  Collections
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-ink">{collection.title}</li>
            </ol>
          </nav>

          <div className="flex items-end justify-between gap-10">
            <div className="max-w-2xl animate-rise">
              <p className="u-label">{collection.group}</p>
              <h1 className="mt-4 font-display text-display-xl">{collection.title}</h1>
              {collection.description && (
                <p className="mt-6 max-w-prose text-base leading-relaxed text-ink-500">
                  {collection.description}
                </p>
              )}
            </div>

            {/* The count, set as a figure. Decorative: the listing below
                states it in words for assistive tech. */}
            <p
              aria-hidden="true"
              className="hidden shrink-0 font-display text-display-xl tabular-nums text-ink-300 md:block"
            >
              {String(products.length).padStart(2, '0')}
            </p>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="u-container py-9 md:py-12">
        {/* CollectionProducts reads ?sort= via useSearchParams, which needs a
            Suspense boundary for this page to stay statically prerendered. */}
        <Suspense fallback={<ProductGrid products={products} />}>
          <CollectionProducts products={products} />
        </Suspense>
      </section>
    </>
  );
}
