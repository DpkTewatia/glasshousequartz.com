import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CollectionProducts from '@/components/commerce/CollectionProducts';
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

          <div className="max-w-2xl">
            <p className="u-label">{collection.group}</p>
            <h1 className="mt-4 font-display text-display-lg">{collection.title}</h1>
            {collection.description && (
              <p className="mt-5 max-w-prose text-[0.9375rem] leading-relaxed text-ink-500">
                {collection.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="u-container py-12 md:py-16">
        <CollectionProducts products={products} />
      </section>
    </>
  );
}
