import Image from 'next/image';
import Link from 'next/link';
import { formatPriceRange } from '@/lib/money';
import type { Product } from '@/lib/types';

/**
 * Product card.
 *
 * The second image is preloaded underneath the first and cross-faded on hover
 * — most of these products are photographed from several angles, and the
 * colourways are the reason people buy. Cards with only one image simply
 * scale it slightly instead.
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

  return (
    <article className="group">
      <Link href={`/products/${product.handle}`} className="block">
        <div className="media-panel relative aspect-[4/5] overflow-hidden">
          {first ? (
            <>
              <Image
                src={first.src}
                alt={first.alt || product.title}
                fill
                sizes={sizes}
                priority={priority}
                className={`object-contain p-2 transition-all duration-700 ease-gallery ${
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
                  className="object-contain p-2 opacity-0 transition-opacity duration-700 ease-gallery group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="u-label">No image</span>
            </div>
          )}

          {!product.available && (
            <span className="absolute left-0 top-0 bg-ink px-3 py-1.5 text-label uppercase text-white">
              Sold out
            </span>
          )}
        </div>

        <div className="pt-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-[0.9375rem] leading-snug">
              <span className="link-draw">{product.title}</span>
            </h3>
            <span className="shrink-0 text-[0.9375rem] tabular-nums text-ink-700">
              {formatPriceRange(product.priceMin, product.priceMax)}
            </span>
          </div>

          {swatchCount > 1 && (
            <p className="mt-1.5 text-xs text-ink-400">{swatchCount} colours</p>
          )}
        </div>
      </Link>
    </article>
  );
}
