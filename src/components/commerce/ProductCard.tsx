import Image from 'next/image';
import Link from 'next/link';
import { discountPercent, formatPriceRange } from '@/lib/money';
import { imageAspect, seamFade } from '@/lib/media';
import type { Product } from '@/lib/types';

/**
 * Product card.
 *
 * The second image is preloaded underneath the first and cross-faded on hover
 * — most of these products are photographed from several angles, and the
 * colourways are the reason people buy. Cards with only one image simply
 * scale it slightly instead. The second image is not rendered at phone widths,
 * where there is no hover to show it, so it is never downloaded there.
 *
 * The panel is square and the photo sits on its bottom edge with no padding.
 * Half the catalog is shot square and fills the panel outright; the rest is
 * 3:2, and anchoring it to the bottom hides the one edge that shows — the
 * grey studio floor — leaving only the near-white top to meet the panel.
 */
export default function ProductCard({
  product,
  priority = false,
  sizes = '(min-width: 1280px) 22vw, (min-width: 768px) 31vw, 45vw',
}: {
  product: Product;
  priority?: boolean;
  sizes?: string;
}) {
  const [first, second] = product.images;
  const colourOption = product.options.find((o) => /colou?r/i.test(o.name));
  const swatchCount = colourOption?.values.length ?? 0;
  const onSale = product.variants.some((v) => discountPercent(v.price, v.compareAtPrice));

  return (
    <article className="reveal group">
      <Link href={`/products/${product.handle}`} className="block">
        <div className="media-panel relative aspect-square overflow-hidden">
          {first ? (
            <>
              <Image
                src={first.src}
                alt={first.alt || product.title}
                fill
                sizes={sizes}
                loading={priority ? 'eager' : 'lazy'}
                style={seamFade(imageAspect(first))}
                className={`object-contain object-bottom transition-all duration-700 ease-gallery ${
                  second ? 'group-hover:opacity-0' : 'group-hover:scale-105'
                }`}
              />
              {second && (
                <Image
                  src={second.src}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes={sizes}
                  loading="lazy"
                  style={seamFade(imageAspect(second))}
                  className="hidden object-contain object-bottom opacity-0 transition-opacity duration-700 ease-gallery group-hover:opacity-100 md:block"
                />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="u-label">No image</span>
            </div>
          )}

          {!product.available ? (
            <span className="absolute left-0 top-0 bg-ink px-3 py-1.5 text-label uppercase text-white">
              Sold out
            </span>
          ) : (
            onSale && (
              <span className="absolute left-0 top-0 bg-sale px-3 py-1.5 text-label uppercase text-white">
                Sale
              </span>
            )
          )}

          {/* Pointer devices only: on touch there is no hover to reveal it. */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 hidden translate-y-full bg-ink py-3 text-center text-label
                       uppercase text-white transition-transform duration-500 ease-gallery
                       group-hover:translate-y-0 md:block"
          >
            View piece
          </span>
        </div>

        <div className="pt-4">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <h3 className="text-[0.9375rem] leading-snug">
              <span className="link-draw">{product.title}</span>
            </h3>
            <span className="shrink-0 text-[0.9375rem] tabular-nums text-ink-700">
              {formatPriceRange(product.priceMin, product.priceMax)}
            </span>
          </div>

          {swatchCount > 1 && (
            <p className="mt-1.5 text-xs text-ink-400">{swatchCount} colors</p>
          )}
        </div>
      </Link>
    </article>
  );
}
