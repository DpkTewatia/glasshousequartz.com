import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductGallery from '@/components/commerce/ProductGallery';
import ProductPurchase from '@/components/commerce/ProductPurchase';
import ProductGrid from '@/components/commerce/ProductGrid';
import SectionHeader from '@/components/ui/SectionHeader';
import { getAllProducts, getCollection, getProduct, getRelatedProducts } from '@/lib/catalog';
import { POLICIES, SITE } from '@/lib/site';

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return {};

  // The old store had no per-product descriptions at all; fall back to a
  // specific, honest sentence rather than the site boilerplate.
  const description =
    product.description ||
    `${product.title} from ${product.brand}. ${
      product.options.find((o) => /colou?r/i.test(o.name))?.values.length ?? 0
        ? `Available in ${product.options.find((o) => /colou?r/i.test(o.name))!.values.length} colors. `
        : ''
    }Ships from Sacramento, California.`;

  return {
    title: product.title,
    description: description.slice(0, 300),
    alternates: { canonical: `/products/${handle}` },
    openGraph: {
      type: 'website',
      title: `${product.title} — ${SITE.name}`,
      description: description.slice(0, 300),
      url: `/products/${handle}`,
      images: product.images.slice(0, 4).map((i) => ({ url: i.src, alt: i.alt })),
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) notFound();

  const related = await getRelatedProducts(handle, 4);
  const primaryCollection = await getCollection(product.collections[0] ?? '');

  // Structured data — the current site publishes none, so no product has ever
  // been eligible for a price or availability rich result.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || product.title,
    image: product.images.slice(0, 6).map((i) => i.src),
    brand: { '@type': 'Brand', name: product.brand },
    ...(product.variants[0]?.sku ? { sku: product.variants[0].sku } : {}),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: ((product.priceMin ?? 0) / 100).toFixed(2),
      highPrice: ((product.priceMax ?? product.priceMin ?? 0) / 100).toFixed(2),
      offerCount: product.variants.length,
      availability: product.available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: SITE.name },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="u-container py-8 md:py-12">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-2 text-xs text-ink-400">
            <li>
              <Link href="/" className="link-draw">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            {primaryCollection && (
              <>
                <li>
                  <Link href={`/collections/${primaryCollection.handle}`} className="link-draw">
                    {primaryCollection.title}
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
              </>
            )}
            <li className="text-ink">{product.title}</li>
          </ol>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} title={product.title} />

          <div className="min-w-0 lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start">
            <p className="u-label">{product.brand}</p>
            <h1 className="mt-4 font-display text-display-md">{product.title}</h1>

            <div className="mt-8">
              <ProductPurchase product={product} />
            </div>

            {product.description && (
              <div className="mt-10 border-t border-line pt-8">
                <p className="max-w-prose text-[0.9375rem] leading-relaxed text-ink-500">
                  {product.description}
                </p>
              </div>
            )}

            {/* Details */}
            <dl className="mt-10 space-y-0 border-t border-line">
              {[
                {
                  k: 'Shipping',
                  v: 'Ships from Sacramento, California. Free over $75.',
                },
                {
                  k: 'Returns',
                  v: `${POLICIES.returnsWindowDays} days from delivery, unused and in original packaging. ${POLICIES.restockingFeePercent}% restocking fee.`,
                },
                {
                  k: 'Wrong size?',
                  v: `Contact us within ${POLICIES.sizeSwapHours} hours of delivery and we will swap it.`,
                },
              ].map((row) => (
                <div key={row.k} className="grid grid-cols-3 gap-4 border-b border-line py-4">
                  <dt className="u-label pt-0.5">{row.k}</dt>
                  <dd className="col-span-2 text-sm leading-relaxed text-ink-500">{row.v}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-6 text-xs leading-relaxed text-ink-400">
              Questions? Email{' '}
              <a href={`mailto:${SITE.email}`} className="link-draw text-ink">
                {SITE.email}
              </a>
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-line">
          <div className="u-container py-band">
            <SectionHeader title="Goes with this." />
            <div className="mt-12">
              <ProductGrid products={related} priorityCount={0} />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
