import Link from 'next/link';

export default function SectionHeader({
  eyebrow,
  title,
  intro,
  href,
  hrefLabel = 'View all',
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="u-label">{eyebrow}</p>}
        <h2 className={`font-display text-display-md ${eyebrow ? 'mt-4' : ''}`}>{title}</h2>
        {intro && (
          <p className="mt-4 max-w-prose text-[0.9375rem] leading-relaxed text-ink-500">{intro}</p>
        )}
      </div>

      {href && (
        <Link href={href} className="btn-quiet shrink-0">
          {hrefLabel}
          <svg width="16" height="9" viewBox="0 0 16 9" fill="none" aria-hidden="true">
            <path d="M0 4.5h14M10 1l4 3.5L10 8" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </Link>
      )}
    </div>
  );
}
