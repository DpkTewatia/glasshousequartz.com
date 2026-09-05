import { ADDRESS_LINE, MAKER, POLICIES, SITE, STORY } from './site';

/**
 * Static page content.
 *
 * Policy pages carry over the substance of the existing site's Terms and
 * Returns pages — the 7-day window, the 10% restocking fee, the 24-hour size
 * swap and the contact address are all taken from the live pages, not
 * invented. They are restructured into sections because the originals were
 * single unbroken walls of text.
 */

export interface PageSection {
  heading?: string;
  body: string[];
}

export interface SitePage {
  slug: string;
  title: string;
  lede?: string;
  eyebrow?: string;
  sections: PageSection[];
  /** Renders the contact form beneath the content. */
  form?: 'contact';
  noindex?: boolean;
}

export const PAGES: SitePage[] = [
  {
    slug: 'about',
    title: STORY.heading,
    eyebrow: 'Our story',
    lede: 'Glasshouse Quartz has been in the glass business in Sacramento for two decades.',
    sections: [
      { body: [...STORY.body] },
      {
        heading: 'What full weld actually means',
        body: [
          'Most quartz bangers are assembled: a cup is made, a joint tube is made, and the two are fused together afterwards. That fused ring is the weakest point in the piece, and it is where cracks start once the banger has been through enough heat cycles.',
          'A full-weld banger is worked from a single piece of quartz, so the cup and the base are continuous. There is no ring, because there was never a second part to attach.',
        ],
      },
      {
        heading: 'Kits, not components',
        body: [
          'A banger on its own is half a purchase. Ours ship with a carb cap that fits the cup and terp pearls sized for it, so the airflow works as designed rather than as whatever combination you managed to assemble from three different sellers.',
        ],
      },
      {
        heading: 'Where we are',
        body: [
          `Everything ships from ${ADDRESS_LINE}. Questions go to ${SITE.email} and are answered by someone who sells this equipment for a living.`,
        ],
      },
    ],
  },

  {
    slug: 'chris-morgan',
    title: 'Chris Morgan',
    eyebrow: MAKER.eyebrow,
    lede: MAKER.body,
    sections: [
      {
        heading: 'Handmade means small numbers',
        body: [
          'Chris works alone and builds each piece by hand. That sets a hard ceiling on how much exists: there is no production run to reorder, and a colour or a shape that sells through is usually gone for good.',
          'It also means no two pieces are quite identical. Small variations in thickness, colour depth and working marks are a signature of hand-blown glass, not a defect.',
        ],
      },
      {
        heading: 'How to get one',
        body: [
          'New work is listed as it arrives and is not announced in advance anywhere except our newsletter. If you want first look, subscribe at the bottom of any page.',
        ],
      },
    ],
  },

  {
    slug: 'contact-us',
    title: 'Contact us',
    eyebrow: 'Get in touch',
    lede: 'Questions about sizing, joints, or an order already placed — send them over and we will come back to you within one business day.',
    sections: [
      {
        heading: 'Direct',
        body: [`Email: ${SITE.email}`, `By mail: ${ADDRESS_LINE}`],
      },
      {
        heading: 'Before you write',
        body: [
          'If you are unsure which joint you need, the two things to check are the angle of your rig (45 or 90 degrees) and the diameter of the joint (10mm, 14mm or 19mm), plus whether it is male or female. Tell us those and we can point you to the right fitting.',
        ],
      },
    ],
    form: 'contact',
  },

  {
    slug: 'shipping',
    title: 'Shipping',
    eyebrow: 'Delivery',
    lede: `Orders ship from ${SITE.address.city}, ${SITE.address.region}. Free shipping on orders over $75.`,
    sections: [
      {
        heading: 'Dispatch',
        body: [
          'Orders placed on a business day are usually packed and dispatched the next business day. Glass is wrapped individually and boxed with fill; quartz ships in its own case.',
        ],
      },
      {
        heading: 'Arrived damaged?',
        body: [
          `Photograph the packaging before you unpack any further and email ${SITE.email} the same day. We cannot assess a breakage claim without a picture of the box it arrived in.`,
        ],
      },
    ],
  },

  {
    slug: 'returns-and-refunds',
    title: 'Returns & refunds',
    eyebrow: 'Policy',
    lede: `Our return window is ${POLICIES.returnsWindowDays} days from delivery.`,
    sections: [
      {
        heading: 'Eligibility',
        body: [
          `To be eligible for a return, the item must be unused, in the same condition you received it, and in its original packaging. Anything returned more than ${POLICIES.returnsWindowDays} days after delivery cannot be accepted.`,
          `Shipping and handling costs are deducted from the refund, and refunds are subject to a ${POLICIES.restockingFeePercent}% restocking fee.`,
        ],
      },
      {
        heading: 'Refunds',
        body: [
          'Once your return arrives and has been inspected, we will email you to confirm we have it and to tell you whether the refund was approved. Approved refunds are credited to the original payment method.',
          `If a refund has not appeared, check with your bank and card issuer first — posting can lag by several days. If it still has not arrived, email ${SITE.email}.`,
        ],
      },
      {
        heading: 'Sale items',
        body: ['Only regular priced items can be refunded. Sale items are final.'],
      },
      {
        heading: 'Exchanges and wrong sizes',
        body: [
          `Ordering the wrong joint size is common and we do not treat it as a problem. Contact us within ${POLICIES.sizeSwapHours} hours of receiving the incorrect size and we will swap it for the right one.`,
          `For any other exchange, email ${SITE.email}. If the item was marked as a gift and shipped directly to you, you will receive a gift credit for the value of the return.`,
        ],
      },
    ],
  },

  {
    slug: 'terms-and-conditions',
    title: 'Terms & conditions',
    eyebrow: 'Legal',
    lede: `This website is operated by ${SITE.name}. By using the site or buying from it, you agree to these terms.`,
    sections: [
      {
        heading: 'Who may buy',
        body: [
          'You must be at least 21 years old, or the legal age in your jurisdiction, to purchase from this store. Our products are sold as accessories intended for use with legal substances only.',
          'You may not use our products for any unlawful purpose, and you may not use this site in a way that breaks any law or regulation in your jurisdiction.',
        ],
      },
      {
        heading: 'Products and pricing',
        body: [
          'Colours and finishes are photographed as accurately as we can manage, but screens vary and hand-worked glass varies. We do not guarantee that what you see on your display is an exact match.',
          'Prices are subject to change without notice. We may at any time modify or discontinue a product, and we are not liable to you or any third party for doing so.',
          'We reserve the right to refuse or limit any order, including orders that appear to be placed by dealers or resellers.',
        ],
      },
      {
        heading: 'Accuracy of information',
        body: [
          'We work to keep product information current, but we do not warrant that descriptions, pricing or availability are error-free. Where an error affects an order you have placed, we will contact you before shipping.',
        ],
      },
      {
        heading: 'Your account and information',
        body: [
          'You agree to provide accurate and current purchase and account information, and to update it as needed so we can complete your orders and reach you.',
        ],
      },
      {
        heading: 'Governing law',
        body: [
          `These terms are governed by the laws of the State of California, United States. ${SITE.name} operates from ${ADDRESS_LINE}.`,
        ],
      },
      {
        heading: 'Changes to these terms',
        body: [
          'The current version of these terms is always the one posted on this page. We may update it at any time, and continuing to use the site after a change means you accept it.',
          `Questions about these terms should be sent to ${SITE.email}.`,
        ],
      },
    ],
  },
];

export const getPage = (slug: string): SitePage | undefined =>
  PAGES.find((p) => p.slug === slug);
