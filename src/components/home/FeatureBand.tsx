import Image from 'next/image';
import Link from 'next/link';

/**
 * Alternating editorial band. Used for the Cookies collaboration, the Trippy
 * Edition run and the Chris Morgan story — the parts of the catalog the old
 * homepage never mentioned, despite Cookies being 53 products.
 *
 * With no image it becomes a centred statement rather than a two-column
 * layout with an empty frame beside it.
 */
export default function FeatureBand({
  eyebrow,
  title,
  body,
  href,
  cta,
  image,
  imageAlt,
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
  reverse?: boolean;
  tone?: 'light' | 'sunk';
}) {
  const sectionTone = tone === 'sunk' ? 'border-y border-line bg-surface-sunk' : '';

  if (!image) {
    return (
      <section className={sectionTone}>
        <div className="u-container flex flex-col items-center py-band text-center">
          <p className="u-label">{eyebrow}</p>
          <h2 className="mt-5 max-w-[18ch] font-display text-display-lg">{title}</h2>
          <div className="mt-6 max-w-prose space-y-4">
            {body.map((p) => (
              <p key={p.slice(0, 24)} className="text-[0.9375rem] leading-relaxed text-ink-500">
                {p}
              </p>
            ))}
          </div>
          <Link href={href} className="btn-outline mt-9">
            {cta}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={sectionTone}>
      <div className="u-container grid items-center gap-12 py-band lg:grid-cols-2 lg:gap-20">
        <div className={reverse ? 'lg:order-2' : ''}>
          <p className="u-label">{eyebrow}</p>
          <h2 className="mt-5 max-w-[14ch] font-display text-display-lg">{title}</h2>
          <div className="mt-6 max-w-prose space-y-4">
            {body.map((p) => (
              <p key={p.slice(0, 24)} className="text-[0.9375rem] leading-relaxed text-ink-500">
                {p}
              </p>
            ))}
          </div>
          <Link href={href} className="btn-outline mt-9">
            {cta}
          </Link>
        </div>

        <div className={reverse ? 'lg:order-1' : ''}>
          <div className="media-panel-wide relative aspect-[3/2] overflow-hidden">
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-contain object-bottom"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
