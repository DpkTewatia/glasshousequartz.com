import Link from 'next/link';
import Wordmark from './Wordmark';
import NewsletterForm from './NewsletterForm';
import { ADDRESS_LINE, FOOTER_LINKS, PAYMENT_METHODS, SITE } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="border-t border-line">
      {/* Newsletter */}
      <div className="border-b border-line">
        <div className="u-container grid gap-10 py-band lg:grid-cols-2 lg:items-end lg:gap-20">
          <div>
            <p className="u-label">Newsletter</p>
            <h2 className="mt-5 max-w-[16ch] font-display text-display-md">
              New drops, before they sell out.
            </h2>
            <p className="mt-4 max-w-prose text-[0.9375rem] leading-relaxed text-ink-500">
              Chris Morgan pieces are one-offs and the Trippy Edition runs are small. Subscribers
              hear first.
            </p>
          </div>
          <NewsletterForm source="footer" />
        </div>
      </div>

      {/* Links */}
      <div className="u-container grid gap-12 py-band md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Wordmark />
          <address className="mt-6 max-w-[28ch] not-italic text-sm leading-relaxed text-ink-500">
            {ADDRESS_LINE}
            <br />
            <a href={`mailto:${SITE.email}`} className="link-draw mt-2 inline-block text-ink">
              {SITE.email}
            </a>
          </address>
        </div>

        {FOOTER_LINKS.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="u-label">{group.title}</h2>
            <ul className="mt-5 space-y-3">
              {group.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-draw text-sm text-ink-700">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Legal */}
      <div className="border-t border-line">
        <div className="u-container flex flex-col gap-5 py-7 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-ink-400">
            © {new Date().getFullYear()} {SITE.name}. Must be 21+ to purchase. For use with legal
            substances only.
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {PAYMENT_METHODS.map((m) => (
              <li key={m} className="text-[0.625rem] uppercase tracking-[0.12em] text-ink-400">
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
