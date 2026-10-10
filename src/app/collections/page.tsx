import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getCollections } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'All Collections',
  description:
    'Every Glasshouse Quartz collection — banger kits, banger hangers, terp pearls, ash catchers, water pipes, recyclers and the full Cookies range.',
  alternates: { canonical: '/collections' },
};

export default async function CollectionsPage() {
  const collections = await getCollections();

  const groups = collections.reduce<Record<string, typeof collections>>((acc, c) => {
    (acc[c.group] ??= []).push(c);
    return acc;
  }, {});

  return (
    <>
      <section className="border-b border-line">
        <div className="u-container py-14 md:py-20">
          <p className="u-label">Catalog</p>
          <h1 className="mt-5 max-w-[14ch] font-display text-display-lg">
            Everything we make and carry.
          </h1>
          <p className="mt-5 max-w-prose text-[0.9375rem] leading-relaxed text-ink-500">
            {collections.reduce((n, c) => n + c.count, 0)} listings across{' '}
            {collections.length} collections.
          </p>
        </div>
      </section>

      {Object.entries(groups).map(([group, items]) => (
        <section key={group} className="border-b border-line last:border-b-0">
          <div className="u-container py-band">
            <h2 className="u-label">{group}</h2>

            <ul className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((c) => (
                <li key={c.handle}>
                  <Link href={`/collections/${c.handle}`} className="group block">
                    <div className="media-panel relative aspect-square overflow-hidden">
                      {c.image && (
                        <Image
                          src={c.image}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                          className="object-contain object-bottom transition-transform duration-700 ease-gallery group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="mt-4 flex items-baseline justify-between gap-4">
                      <h3 className="text-[0.9375rem]">
                        <span className="link-draw">{c.title}</span>
                      </h3>
                      <span className="shrink-0 text-xs tabular-nums text-ink-400">{c.count}</span>
                    </div>
                    {c.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-500">
                        {c.description}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
    </>
  );
}
