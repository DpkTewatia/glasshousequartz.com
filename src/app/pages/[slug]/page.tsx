import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ContactForm from '@/components/site/ContactForm';
import { PAGES, getPage } from '@/lib/pages';

export function generateStaticParams() {
  return PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) return {};

  return {
    title: page.title,
    description: page.lede ?? page.sections[0]?.body[0]?.slice(0, 300),
    alternates: { canonical: `/pages/${slug}` },
    robots: page.noindex ? { index: false, follow: true } : undefined,
  };
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) notFound();

  return (
    <article>
      <header className="border-b border-line">
        <div className="u-container py-14 md:py-20">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-xs text-ink-400">
              <li>
                <Link href="/" className="link-draw">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-ink">{page.title}</li>
            </ol>
          </nav>

          {page.eyebrow && <p className="u-label">{page.eyebrow}</p>}
          <h1 className="mt-5 max-w-[18ch] font-display text-display-lg">{page.title}</h1>
          {page.lede && (
            <p className="mt-6 max-w-prose text-base leading-relaxed text-ink-500">{page.lede}</p>
          )}
        </div>
      </header>

      <div className="u-container grid gap-10 py-band lg:grid-cols-12 lg:gap-16">
        {/* Section index — these pages replace unbroken walls of text */}
        {page.sections.some((s) => s.heading) && (
          <nav aria-label="On this page" className="lg:col-span-3">
            <p className="u-label">Contents</p>
            <ul className="mt-5 space-y-2.5 lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              {page.sections
                .filter((s) => s.heading)
                .map((s) => (
                  <li key={s.heading}>
                    <a
                      href={`#${slugify(s.heading!)}`}
                      className="link-draw text-sm text-ink-500"
                    >
                      {s.heading}
                    </a>
                  </li>
                ))}
            </ul>
          </nav>
        )}

        <div className="lg:col-span-8 lg:col-start-5">
          {page.sections.map((section, i) => (
            <section
              key={section.heading ?? i}
              id={section.heading ? slugify(section.heading) : undefined}
              className="scroll-mt-[calc(var(--header-h)+2rem)] border-t border-line py-9 first:border-t-0 first:pt-0"
            >
              {section.heading && (
                <h2 className="font-display text-display-sm">{section.heading}</h2>
              )}
              <div className={`max-w-prose space-y-4 ${section.heading ? 'mt-4' : ''}`}>
                {section.body.map((p) => (
                  <p key={p.slice(0, 32)} className="text-[0.9375rem] leading-relaxed text-ink-700">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}

          {page.form === 'contact' && (
            <section className="border-t border-line pt-10">
              <h2 className="font-display text-display-sm">Send a message</h2>
              <div className="mt-6 max-w-xl">
                <ContactForm />
              </div>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
