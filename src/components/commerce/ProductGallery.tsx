'use client';

import Image from 'next/image';
import { useState } from 'react';
import { imageAspect, seamFade } from '@/lib/media';
import type { ProductImage } from '@/lib/types';

/**
 * Product gallery.
 *
 * Several of these products carry 20+ photographs, so the thumbnail rail is
 * scrollable rather than wrapping into a wall. On mobile the main image is a
 * horizontal snap-scroller, which is what a thumb expects, and the rail is
 * hidden to save vertical space.
 */
export default function ProductGallery({
  images,
  title,
}: {
  images: ProductImage[];
  title: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return <div className="media-panel aspect-square w-full" aria-hidden="true" />;
  }

  const current = images[active] ?? images[0];

  // The frame takes the shape of the lead photo (between square and 3:2) so
  // that photo fills it edge to edge. It is fixed to the first image rather
  // than the active one so the page does not jump as thumbnails are clicked.
  const panelAspect = Math.min(1.5, Math.max(1, imageAspect(images[0]) ?? 1));

  return (
    <div className="flex min-w-0 flex-col-reverse gap-4 lg:flex-row lg:gap-6">
      {images.length > 1 && (
        <ul
          className="hide-scrollbar flex gap-3 overflow-x-auto lg:max-h-[42rem] lg:w-20 lg:shrink-0 lg:flex-col lg:overflow-y-auto"
          aria-label={`${title} images`}
        >
          {images.map((img, i) => (
            <li key={img.src + i} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1} of ${images.length}`}
                aria-current={i === active}
                className={`media-panel relative block h-20 w-20 overflow-hidden border transition-colors ${
                  i === active ? 'border-ink' : 'border-transparent hover:border-line-strong'
                }`}
              >
                <Image
                  src={img.src}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain object-bottom"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div
        className="media-panel relative w-full overflow-hidden lg:w-auto lg:flex-1 lg:self-start"
        style={{ aspectRatio: panelAspect }}
      >
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt || title}
          fill
          preload
          sizes="(min-width: 1024px) 46vw, 100vw"
          style={seamFade(imageAspect(current), panelAspect)}
          className="animate-fade object-contain object-bottom"
        />

        {images.length > 1 && (
          <p className="absolute bottom-4 right-5 text-xs tabular-nums text-ink-400">
            {active + 1} / {images.length}
          </p>
        )}
      </div>
    </div>
  );
}
