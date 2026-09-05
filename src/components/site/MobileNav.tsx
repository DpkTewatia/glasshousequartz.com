import Link from 'next/link';
import type { Collection } from '@/lib/types';
import Wordmark from './Wordmark';

/**
 * Mobile navigation, using Bootstrap's offcanvas and collapse behaviour.
 * Every entry is a real link, so the menu still navigates if the Bootstrap
 * bundle fails to load.
 */
export default function MobileNav({
  groups,
}: {
  groups: { group: string; collections: Collection[] }[];
}) {
  return (
    <div
      className="offcanvas offcanvas-start"
      tabIndex={-1}
      id="mobile-nav"
      aria-labelledby="mobile-nav-title"
    >
      <div className="flex h-[var(--header-h)] items-center justify-between border-b border-line px-gutter">
        <h2 id="mobile-nav-title" className="sr-only">
          Menu
        </h2>
        <Wordmark />
        <button
          type="button"
          className="-mr-2 p-2"
          data-bs-dismiss="offcanvas"
          aria-label="Close menu"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </button>
      </div>

      <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-gutter py-6">
        {groups.map((group, gi) => {
          const id = `mnav-${gi}`;
          return (
            <div key={group.group} className="border-b border-line">
              <button
                type="button"
                className="flex w-full items-center justify-between py-4 text-left"
                data-bs-toggle="collapse"
                data-bs-target={`#${id}`}
                aria-expanded={gi === 0}
                aria-controls={id}
              >
                <span className="text-[0.9375rem] font-medium">{group.group}</span>
                <span className="text-lg leading-none text-ink-400">+</span>
              </button>

              <div id={id} className={`collapse ${gi === 0 ? 'show' : ''}`}>
                <ul className="pb-4">
                  {group.collections.map((c) => (
                    <li key={c.handle}>
                      <Link
                        href={`/collections/${c.handle}`}
                        data-bs-dismiss="offcanvas"
                        className="flex items-baseline justify-between py-2.5 text-[0.9375rem] text-ink-700"
                      >
                        {c.title}
                        <span className="text-xs tabular-nums text-ink-400">{c.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}

        <div className="mt-8 flex flex-col gap-4">
          <Link href="/collections/cookies" data-bs-dismiss="offcanvas" className="text-[0.9375rem] font-medium">
            Cookies Collection
          </Link>
          <Link href="/pages/chris-morgan" data-bs-dismiss="offcanvas" className="text-[0.9375rem] font-medium">
            Chris Morgan
          </Link>
          <Link href="/collections" data-bs-dismiss="offcanvas" className="text-[0.9375rem] font-medium">
            All Collections
          </Link>
          <Link href="/pages/contact-us" data-bs-dismiss="offcanvas" className="text-[0.9375rem] text-ink-500">
            Contact
          </Link>
        </div>
      </nav>
    </div>
  );
}
