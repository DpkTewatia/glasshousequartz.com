import Image from 'next/image';
import Link from 'next/link';
import { formatPriceRange } from '@/lib/money';
import type { Product } from '@/lib/types';

/**
 * Hero.
 *
 * The old slideshow rotated three untitled banners and said nothing. This
 * states the one claim that differentiates the product — full weld, single
 * piece — and puts a real, buyable product next to it, priced and linked.
 */
export default function Hero({ product }: { product: Product | null }) {
  return (
    <section className="border-b border-line">
      <div className="u-container grid items-center gap-12 py-14 lg:grid-cols-2 lg:gap-20 lg:py-24">
        <div className="order-2 lg:order-1">
          <p className="u-label">Sacramento, California · Since 2005</p>

          <h1 className="mt-7 font-display text-display-xl">
            Full weld.
            <br />
            <span className="italic">One piece of quartz.</span>
          </h1>

          <p className="mt-7 max-w-prose text-base leading-relaxed text-ink-500">
            A banger fails at the joint. Ours does not have one — the cup and the base are formed
            from a single piece of quartz, so there is no seam to crack when you heat it hard, every
            day, for years.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/collections/banger-kits" className="btn-ink">
              Shop banger kits
            </Link>
            <Link href="/collections" className="btn-quiet">
              All collections
              <svg width="16" height="9" viewBox="0 0 16 9" fill="none" aria-hidden="true">
                <path d="M0 4.5h14M10 1l4 3.5L10 8" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </Link>
          </div>

          <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-7">
            {[
              { k: '20 yrs', v: 'In glass' },
              { k: 'Full weld', v: 'No seam' },
              { k: 'Kit', v: 'Cap + pearls' },
            ].map((s) => (
              <div key={s.k}>
                <dt className="text-[0.9375rem] text-ink">{s.k}</dt>
                <dd className="mt-1 text-xs uppercase tracking-[0.12em] text-ink-400">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {product && (
          <div className="order-1 lg:order-2">
            <Link href={`/products/${product.handle}`} className="group block">
              <div className="media-panel relative aspect-[5/6] overflow-hidden">
                {product.images[0] && (
                  <Image
                    src={product.images[0].src}
                    alt={product.images[0].alt || product.title}
                    fill
                    priority
                    sizes="(min-width: 1024px) 46vw, 100vw"
                    className="object-contain p-4 transition-transform duration-1000 ease-gallery group-hover:scale-[1.03] md:p-6"
                  />
                )}
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-6">
                <p className="text-[0.9375rem]">
                  <span className="link-draw">{product.title}</span>
                </p>
                <p className="shrink-0 text-[0.9375rem] tabular-nums text-ink-700">
                  {formatPriceRange(product.priceMin, product.priceMax)}
                </p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
