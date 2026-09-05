import Image from 'next/image';
import Link from 'next/link';
import type { Collection } from '@/lib/types';

/**
 * Collection cards. On narrow screens this becomes a snap-scrolling rail so
 * the cards keep a usable size instead of shrinking to thumbnails.
 */
export default function CollectionRail({ collections }: { collections: Collection[] }) {
  return (
    <ul
      className="hide-scrollbar -mx-gutter flex snap-x snap-mandatory gap-5 overflow-x-auto px-gutter
                 md:mx-0 md:grid md:grid-cols-2 md:gap-8 md:overflow-visible md:px-0 lg:grid-cols-4"
    >
      {collections.map((c) => (
        <li key={c.handle} className="w-[72vw] shrink-0 snap-start sm:w-[48vw] md:w-auto">
          <Link href={`/collections/${c.handle}`} className="group block">
            <div className="media-panel relative aspect-[4/5] overflow-hidden">
              {c.image && (
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 22vw, (min-width: 768px) 45vw, 72vw"
                  className="object-contain p-3 transition-transform duration-700 ease-gallery group-hover:scale-105"
                />
              )}
              <span className="absolute bottom-0 left-0 bg-surface px-4 py-2 text-label uppercase text-ink-500">
                {c.count} {c.count === 1 ? 'piece' : 'pieces'}
              </span>
            </div>

            <h3 className="mt-4 text-[1.0625rem]">
              <span className="link-draw">{c.title}</span>
            </h3>
            {c.description && (
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-500">
                {c.description}
              </p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
