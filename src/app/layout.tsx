// Bootstrap first: its Reboot is the single base reset, and loading it here
// guarantees Tailwind's utilities (in globals.css) cascade after it.
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';

import type { Metadata, Viewport } from 'next';
import { preconnect } from 'react-dom';
import { Inter, Instrument_Serif } from 'next/font/google';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import AgeGate from '@/components/site/AgeGate';
import BootstrapClient from '@/components/site/BootstrapClient';
import CartProvider from '@/components/commerce/CartProvider';
import { SITE } from '@/lib/site';

const sans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Full-Weld Quartz Bangers & Glass`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    'quartz bangers',
    'full weld banger',
    'banger hangers',
    'terp pearls',
    'ash catchers',
    'dab rigs',
    'Cookies glass',
    'recyclers',
  ],
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    url: SITE.url,
    title: `${SITE.name} — Full-Weld Quartz Bangers & Glass`,
    description: SITE.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — Full-Weld Quartz Bangers & Glass`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

// Tells search engines who runs the store, from the same constants the footer uses.
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: SITE.name,
  url: SITE.url,
  email: SITE.email,
  foundingDate: SITE.founded,
  description: SITE.description,
  address: {
    '@type': 'PostalAddress',
    streetAddress: SITE.address.street,
    addressLocality: SITE.address.city,
    addressRegion: SITE.address.region,
    postalCode: SITE.address.postalCode,
    addressCountry: SITE.address.country,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Every photo comes from this host; opening the connection while the HTML
  // is still arriving takes that setup time off the first image.
  preconnect('https://cdn.shopify.com');

  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="bg-surface font-sans text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]
                     focus:bg-ink focus:px-4 focus:py-2 focus:text-label-lg focus:uppercase focus:text-white"
        >
          Skip to content
        </a>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />

        <CartProvider>
          <AgeGate />
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </CartProvider>
        <BootstrapClient />
      </body>
    </html>
  );
}
