/**
 * Site-wide constants and editorial copy.
 *
 * Business details, policy text and the Chris Morgan story are carried over
 * verbatim in substance from the existing glasshousequartz.com so nothing
 * factual is invented here. Marketing copy has been rewritten for the new
 * layout; every claim it makes ("full weld", "single piece of quartz",
 * "20 years") already appears on the current site.
 */

export const SITE = {
  name: 'Glasshouse Quartz',
  shortName: 'Glasshouse',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.glasshousequartz.com',
  description:
    'Full-weld quartz bangers, banger hangers, terp pearls and glass — made from a single piece of quartz and built to survive daily heat. Plus the full Cookies glass collection.',
  email: 'glasshousepremium@gmail.com',
  address: {
    street: '333 North 7th Street',
    city: 'Sacramento',
    region: 'CA',
    postalCode: '95811',
    country: 'US',
  },
  founded: '2005',
} as const;

export const ADDRESS_LINE = `${SITE.address.street}, ${SITE.address.city}, ${SITE.address.region} ${SITE.address.postalCode}`;

/** Rotating strip above the header. */
export const ANNOUNCEMENTS = [
  'Full-weld quartz — one piece, no seams to fail',
  'Free shipping on orders over $75',
  'Shipped from Sacramento, California',
] as const;

/** The three things a first-time visitor needs to believe. */
export const VALUE_PROPS = [
  {
    title: 'Full weld, single piece',
    body:
      'Every Glasshouse banger is formed from one piece of quartz. No glued joint at the base means no seam to crack when the piece is heated hard, day after day.',
  },
  {
    title: 'Twenty years in glass',
    body:
      'We have been buying, selling and using this equipment for two decades, and we work directly with local blowers rather than reselling anonymous stock.',
  },
  {
    title: 'Complete kits, not parts',
    body:
      'Banger kits ship with the matching carb cap and terp pearls already sized for the cup, so what arrives is ready to use rather than a shopping list.',
  },
] as const;

export const STORY = {
  eyebrow: 'Made and sold in Sacramento',
  heading: 'We sell what we use.',
  body: [
    'Glasshouse Quartz began as a glass shop, not a marketing exercise. Twenty years of standing behind a counter taught us which pieces come back broken and which ones customers replace only because they wanted a second colour.',
    'That is why our bangers are full weld. A single piece of quartz, heated and worked into shape, with the base and the cup formed as one — because the joint is where a banger fails first.',
  ],
} as const;

export const MAKER = {
  name: 'Chris Morgan',
  eyebrow: 'Local blower',
  // Substance preserved from the existing collection description.
  body:
    'Chris Morgan is a local blower we have worked with for twenty years. He builds custom pieces by hand, one at a time — which is why his work arrives in small numbers and rarely repeats.',
} as const;

export const POLICIES = {
  returnsWindowDays: 7,
  restockingFeePercent: 10,
  sizeSwapHours: 24,
} as const;

export const SHIPPING_THRESHOLD_CENTS = 7500;

/** Footer link groups. */
export const FOOTER_LINKS = [
  {
    title: 'Shop',
    links: [
      { label: 'Banger Kits', href: '/collections/banger-kits' },
      { label: 'Trippy Edition', href: '/collections/etched-bangers' },
      { label: 'Banger Hangers', href: '/collections/banger-hangers' },
      { label: 'Terp Pearls', href: '/collections/terp-pearls' },
      { label: 'Water Pipes', href: '/collections/water-pipes' },
      { label: 'Cookies', href: '/collections/cookies' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Contact Us', href: '/pages/contact-us' },
      { label: 'Returns & Refunds', href: '/pages/returns-and-refunds' },
      { label: 'Shipping', href: '/pages/shipping' },
      { label: 'Terms & Conditions', href: '/pages/terms-and-conditions' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Our Story', href: '/pages/about' },
      { label: 'Chris Morgan', href: '/pages/chris-morgan' },
      { label: 'All Collections', href: '/collections' },
    ],
  },
] as const;

export const PAYMENT_METHODS = [
  'Visa',
  'Mastercard',
  'American Express',
  'Discover',
  'Diners Club',
  'JCB',
] as const;
