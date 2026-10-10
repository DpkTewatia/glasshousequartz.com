import Image from 'next/image';
import Link from 'next/link';
import { seamFade } from '@/lib/media';

/** Width / height of the image frame below. */
const PANEL_ASPECT = 3 / 2;

/**
 * Alternating editorial band. Used for the Cookies collaboration, the Trippy
 * Edition run and the Chris Morgan story — the parts of the catalog the old
 * homepage never mentioned, despite Cookies being 53 products.
 *
 * With no image it becomes a centred statement rather than a two-column
 * layout with an empty frame beside it. The `ink` tone is meant for that
 * form: one dark band mid-page, so the white ones either side read as light.
 */
export default function FeatureBand({
  eyebrow,
  title,
  body,
  href,
  cta,
  image,
  imageAlt,
  imageAspect,
  reverse = false,
  tone = 'light',
}: {
  eyebrow: string;
  title: string;
  body: string[];
  href: string;
  cta: string;
  image: string | null;
  imageAlt: string;
  /** Width / height of `image`, when known. */
  imageAspect?: number;
  reverse?: boolean;
  tone?: 'light' | 'sunk' | 'ink';
}) {
  const ink = tone === 'ink';
  const sectionTone = ink
    ? 'on-ink bg-ink text-white'
    : tone === 'sunk'
      ? 'border-y border-line bg-surface-sunk'
      : '';
  const eyebrowTone = ink ? 'text-white/50' : '';
  const bodyTone = ink ? 'text-white/65' : 'text-ink-500';
  const button = ink ? 'btn-outline-inverse' : 'btn-outline';

  if (!image) {
    return (
      <section className={sectionTone}>
        <div className="reveal u-container flex flex-col items-center py-band text-center">
          <p className={`u-label ${eyebrowTone}`}>{eyebrow}</p>
          <h2 className="mt-6 max-w-[16ch] font-display text-display-xl">{title}</h2>
          <div className="mt-8 max-w-prose space-y-4">
            {body.map((p) => (
              <p key={p.slice(0, 24)} className={`text-base leading-relaxed ${bodyTone}`}>
                {p}
              </p>
            ))}
          </div>
          <Link href={href} className={`${button} mt-10`}>
            {cta}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={sectionTone}>
      <div className="u-container grid items-center gap-12 py-band lg:grid-cols-2 lg:gap-20">
        <div className={`reveal ${reverse ? 'lg:order-2' : ''}`}>
          <p className={`u-label ${eyebrowTone}`}>{eyebrow}</p>
          <h2 className="mt-5 max-w-[14ch] font-display text-display-lg">{title}</h2>
          <div className="mt-6 max-w-prose space-y-4">
            {body.map((p) => (
              <p key={p.slice(0, 24)} className={`text-[0.9375rem] leading-relaxed ${bodyTone}`}>
                {p}
              </p>
            ))}
          </div>
          <Link href={href} className={`${button} mt-9`}>
            {cta}
          </Link>
        </div>

        <div className={`reveal ${reverse ? 'lg:order-1' : ''}`}>
          <div className="media-panel-wide relative aspect-[3/2] overflow-hidden">
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="(min-width: 1024px) 46vw, 100vw"
              style={seamFade(imageAspect, PANEL_ASPECT)}
              className="object-contain object-bottom"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
