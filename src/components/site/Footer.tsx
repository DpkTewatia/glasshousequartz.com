import Link from 'next/link';
import Wordmark from './Wordmark';
import NewsletterForm from './NewsletterForm';
import { ADDRESS_LINE, FOOTER_LINKS, PAYMENT_METHODS, SITE } from '@/lib/site';

/**
 * The page closes on ink. Everything above it is white so the glass supplies
 * the colour; the footer is where the gallery turns the lights down.
 */
export default function Footer() {
  return (
    <footer className="on-ink overflow-hidden bg-ink text-white">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="u-container grid gap-10 py-band lg:grid-cols-2 lg:items-end lg:gap-20">
          <div className="reveal">
            <p className="u-label text-white/50">Newsletter</p>
            <h2 className="mt-5 max-w-[16ch] font-display text-display-lg">
              New drops, <span className="italic">before they sell out.</span>
            </h2>
            <p className="mt-5 max-w-prose text-[0.9375rem] leading-relaxed text-white/60">
              Chris Morgan pieces are one-offs and the Trippy Edition runs are small. Subscribers
              hear first.
            </p>
          </div>
          <NewsletterForm source="footer" inverse />
        </div>
      </div>

      {/* Links */}
      <div className="u-container grid gap-12 py-16 md:grid-cols-2 md:py-20 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Wordmark inverse />
          <address className="mt-6 max-w-[28ch] not-italic text-sm leading-relaxed text-white/60">
            {ADDRESS_LINE}
            <br />
            <a href={`mailto:${SITE.email}`} className="link-draw mt-2 inline-block text-white">
              {SITE.email}
            </a>
          </address>
        </div>

        {FOOTER_LINKS.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="u-label text-white/50">{group.title}</h2>
            <ul className="mt-5 space-y-3">
              {group.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="link-draw text-sm text-white/75 transition-colors duration-200 hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* Sign-off: the name, set as large as the page allows. */}
      <div className="u-container" aria-hidden="true">
        <p className="select-none whitespace-nowrap font-display text-[clamp(4.5rem,26.5vw,24rem)] leading-[0.8] tracking-[-0.04em] text-white/[0.07]">
          Glasshouse
        </p>
      </div>

      {/* Legal */}
      <div className="border-t border-white/10">
        <div className="u-container flex flex-col gap-5 py-7 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} {SITE.name}. Must be 21+ to purchase. For use with legal
            substances only.
          </p>
          <ul className="flex flex-wrap gap-2" aria-label="Accepted payment methods">
            {PAYMENT_METHODS.map((m) => (
              <li
                key={m}
                className="border border-white/15 px-2.5 py-1.5 text-[0.625rem] uppercase leading-none tracking-[0.12em] text-white/60"
              >
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
