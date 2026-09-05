import Link from 'next/link';
import type { Metadata } from 'next';
import Hero from '@/components/home/Hero';
import ValueProps from '@/components/home/ValueProps';
import CollectionRail from '@/components/home/CollectionRail';
import FeatureBand from '@/components/home/FeatureBand';
import ProductGrid from '@/components/commerce/ProductGrid';
import SectionHeader from '@/components/ui/SectionHeader';
import { getCollection, getCollections, getProductsInCollection, sortProducts } from '@/lib/catalog';
import { MAKER, SITE, STORY } from '@/lib/site';

export const metadata: Metadata = {
  description: SITE.description,
  alternates: { canonical: '/' },
};

const FEATURED_HANDLES = ['banger-kits', 'banger-hangers', 'terp-pearls', 'etched-bangers'];

export default async function HomePage() {
  const [collections, bangerKits, hangers, cookies, etched] = await Promise.all([
    getCollections(),
    getProductsInCollection('banger-kits'),
    getProductsInCollection('banger-hangers'),
    getCollection('cookies'),
    getCollection('etched-bangers'),
  ]);

  const featured = FEATURED_HANDLES.map((h) => collections.find((c) => c.handle === h)).filter(
    (c): c is NonNullable<typeof c> => Boolean(c),
  );

  const bestSellers = sortProducts(bangerKits, 'featured').slice(0, 8);
  const heroProduct = sortProducts(hangers, 'featured')[0] ?? bestSellers[0] ?? null;

  const shopByGroup = collections.filter((c) => c.handle !== 'cookies' && c.handle !== 'glasshouse');

  return (
    <>
      <Hero product={heroProduct} />
      <ValueProps />

      {/* Featured collections */}
      <section className="u-container py-band">
        <SectionHeader
          eyebrow="Shop by category"
          title="Where most people start."
          intro="Kits ship complete with the matching carb cap and terp pearls, sized for the cup."
          href="/collections"
        />
        <div className="mt-12">
          <CollectionRail collections={featured} />
        </div>
      </section>

      {/* Best sellers */}
      <section className="border-t border-line">
        <div className="u-container py-band">
          <SectionHeader
            eyebrow="Banger kits"
            title="Complete, not a parts list."
            href="/collections/banger-kits"
            hrefLabel={`All ${bangerKits.length} kits`}
          />
          <div className="mt-12">
            <ProductGrid products={bestSellers} />
          </div>
        </div>
      </section>

      {/* Brand story */}
      <section className="border-y border-line bg-surface-sunk">
        <div className="u-container grid gap-10 py-band lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="u-label">{STORY.eyebrow}</p>
            <h2 className="mt-5 font-display text-display-lg">{STORY.heading}</h2>
          </div>
          <div className="max-w-prose space-y-5 lg:col-span-6 lg:col-start-7">
            {STORY.body.map((p) => (
              <p key={p.slice(0, 24)} className="text-base leading-relaxed text-ink-700">
                {p}
              </p>
            ))}
            <Link href="/pages/about" className="btn-quiet !mt-8">
              Our story
              <svg width="16" height="9" viewBox="0 0 16 9" fill="none" aria-hidden="true">
                <path d="M0 4.5h14M10 1l4 3.5L10 8" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Cookies */}
      {cookies && (
        <FeatureBand
          eyebrow="Collaboration"
          title="The full Cookies range."
          body={[
            'Licensed Cookies glass, from the Bayside series and Honey quartz through to the Cycler line — water pipes, rigs, bangers, hand pipes and accessories.',
            `${cookies.count} pieces, and the part of our catalog that turns over fastest.`,
          ]}
          href="/collections/cookies"
          cta="Shop Cookies"
          image={cookies.image}
          imageAlt="Cookies glass"
        />
      )}

      {/* Trippy Edition */}
      {etched && (
        <FeatureBand
          eyebrow="Limited run"
          title="Trippy Edition, etched."
          body={[
            'Full-weld bangers finished with deep-etched artwork — seven styles, each cut in a small run and not repeated once it sells through.',
            'Same quartz, same weld. The difference is on the outside.',
          ]}
          href="/collections/etched-bangers"
          cta="See the seven styles"
          image={etched.image}
          imageAlt="Trippy Edition etched banger"
          reverse
          tone="sunk"
        />
      )}

      {/* Chris Morgan */}
      <FeatureBand
        eyebrow={MAKER.eyebrow}
        title="Twenty years with one blower."
        body={[
          MAKER.body,
          'Because every piece is made by hand, no two are identical and stock arrives in small numbers. When one sells, it is gone.',
        ]}
        href="/pages/chris-morgan"
        cta="About Chris Morgan"
        image={null}
        imageAlt=""
      />

      {/* Full category index — every collection, nothing hidden */}
      <section className="border-t border-line">
        <div className="u-container py-band">
          <SectionHeader eyebrow="Everything" title="The full catalog." />
          <ul className="mt-12 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {shopByGroup.map((c) => (
              <li key={c.handle}>
                <Link
                  href={`/collections/${c.handle}`}
                  className="group flex items-baseline justify-between gap-6 border-b border-line py-4"
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
      </section>
    </>
  );
}
