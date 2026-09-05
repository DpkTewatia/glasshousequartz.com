import Link from 'next/link';
import { getNavigation } from '@/lib/catalog';
import { ANNOUNCEMENTS } from '@/lib/site';
import Wordmark from './Wordmark';
import AnnouncementBar from './AnnouncementBar';
import CartDrawer from '@/components/commerce/CartDrawer';
import CartButton from '@/components/commerce/CartButton';
import MobileNav from './MobileNav';
import SearchDialog from './SearchDialog';

/**
 * Server component, but deliberately free of any per-visitor data. The cart
 * lives in a client island (CartButton / CartDrawer) so that reading it never
 * forces the pages underneath this header to render dynamically.
 */
export default async function Header() {
  const groups = await getNavigation();

  return (
    <>
      <AnnouncementBar items={[...ANNOUNCEMENTS]} />

      <header className="sticky top-0 z-50 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
        <div className="u-container flex h-[var(--header-h)] items-center justify-between gap-6">
          {/* Mobile: menu trigger */}
          <button
            type="button"
            className="-ml-2 p-2 lg:hidden"
            data-bs-toggle="offcanvas"
            data-bs-target="#mobile-nav"
            aria-controls="mobile-nav"
            aria-label="Open menu"
          >
            <span className="block h-px w-6 bg-ink" />
            <span className="mt-[6px] block h-px w-6 bg-ink" />
            <span className="mt-[6px] block h-px w-4 bg-ink" />
          </button>

          <Link href="/" aria-label="Glasshouse Quartz — home" className="shrink-0">
            <Wordmark />
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Primary" className="hidden lg:flex lg:items-center lg:gap-8">
            {groups.map((group) => (
              <div key={group.group} className="dropdown static">
                <button
                  type="button"
                  className="btn-quiet py-2"
                  data-bs-toggle="dropdown"
                  data-bs-display="static"
                  aria-expanded="false"
                >
                  {group.group}
                  <svg width="9" height="6" viewBox="0 0 9 6" aria-hidden="true" className="mt-px">
                    <path d="M1 1L4.5 4.5L8 1" stroke="currentColor" strokeWidth="1.2" fill="none" />
                  </svg>
                </button>

                <div className="dropdown-menu mt-0 w-full border-x-0 border-b border-t-0 border-line bg-surface p-0 shadow-none">
                  <div className="u-container grid grid-cols-2 gap-x-10 gap-y-1 py-10 md:grid-cols-4">
                    {group.collections.map((c) => (
                      <Link
                        key={c.handle}
                        href={`/collections/${c.handle}`}
                        className="group flex items-baseline justify-between border-b border-line-soft py-3"
                      >
                        <span className="text-[0.9375rem] transition-opacity group-hover:opacity-60">
                          {c.title}
                        </span>
                        <span className="text-xs tabular-nums text-ink-400">{c.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <Link href="/collections/cookies" className="btn-quiet link-draw py-2">
              Cookies
            </Link>
            <Link href="/pages/chris-morgan" className="btn-quiet link-draw py-2">
              Chris Morgan
            </Link>
          </nav>

          {/* Utilities */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-2.5 transition-opacity hover:opacity-60"
              data-bs-toggle="offcanvas"
              data-bs-target="#search-panel"
              aria-controls="search-panel"
              aria-label="Search"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.3" />
                <path d="M12.5 12.5L16.5 16.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>

            <CartButton />
          </div>
        </div>
      </header>

      <MobileNav groups={groups} />
      <SearchDialog />
      <CartDrawer />
    </>
  );
}
