/**
 * Normalises the raw Shopify export in data/raw into a single, clean catalog
 * at data/catalog.json.
 *
 * Why this exists
 * ---------------
 * The live Brooklyn storefront has 74 collections but only 13 that actually
 * render products. 41 of the 118 published products are orphaned: they are not
 * reachable from any working collection page, only by direct link or search.
 *
 * This script rebuilds a taxonomy that covers every product. It keeps the real
 * Shopify collection membership wherever the storefront exposed it, and derives
 * membership for everything else from product titles. Every derived rule is
 * declared in CATEGORY_RULES below so the mapping is auditable, not magic.
 *
 * Run: npm run catalog
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RAW = path.join(ROOT, 'data', 'raw');
const OUT = path.join(ROOT, 'data', 'catalog.json');

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

/* ------------------------------------------------------------------ *
 * Taxonomy
 * ------------------------------------------------------------------ */

/** Ordered. A product joins every group whose `match` returns true. */
const CATEGORY_RULES = [
  // --- Glasshouse quartz ---
  {
    handle: 'banger-kits',
    title: 'Banger Kits',
    group: 'Glasshouse Quartz',
    description:
      'Full-weld quartz banger kits, each supplied with the matching carb cap and terp pearls. One piece of quartz, no seams to fail.',
    match: (t) => /banger kit/.test(t),
  },
  {
    handle: 'etched-bangers',
    title: 'Trippy Edition Etched',
    group: 'Glasshouse Quartz',
    description:
      'Our Trippy Edition series: full-weld bangers finished with deep-etched artwork. Seven styles, each a limited run.',
    match: (t) => /trippy edition/.test(t),
  },
  {
    handle: 'banger-hangers',
    title: 'Banger Hangers',
    group: 'Glasshouse Quartz',
    description:
      'Borosilicate stands that keep a hot banger off your surface and your kit in one place. Fifteen silhouettes, most in six colourways.',
    match: (t) => /banger hanger/.test(t),
  },
  {
    handle: 'ash-catchers',
    title: 'Ash Catchers',
    group: 'Glasshouse Quartz',
    description:
      'Keep your water clean and your pipe cleaner. Tree perc, showerhead, barrel diffuser and sidecar, in 45 and 90 degree fittings.',
    match: (t) => /ash catcher/.test(t),
  },
  {
    handle: 'terp-pearls',
    title: 'Terp Pearls & Inserts',
    group: 'Glasshouse Quartz',
    description:
      'Pearls, pillars, drop screws and dichro sets. The small parts that decide how evenly a banger pulls.',
    match: (t) =>
      /terp set|terp pearl|pillar terp|drop screw|glow terp|dicro|honey twist|honey cone|cone heads|bling tips/.test(t),
  },
  {
    handle: 'carb-caps',
    title: 'Carb Caps',
    group: 'Glasshouse Quartz',
    description: 'Marble and directional caps that hold heat where you want it.',
    match: (t) => /carb cap|\bstone\b/.test(t),
  },
  {
    handle: 'dab-tools',
    title: 'Dab Tools',
    group: 'Glasshouse Quartz',
    description: 'Stainless steel and titanium tools, flat and scoop.',
    match: (t) => /wax tool|dabber/.test(t),
  },
  {
    handle: 'reclaim',
    title: 'Reclaim Kits',
    group: 'Glasshouse Quartz',
    description: 'Catch and recover. Twelve joint configurations, male and female.',
    match: (t) => /reclaim/.test(t),
  },

  // --- Glass ---
  {
    handle: 'water-pipes',
    title: 'Water Pipes',
    group: 'Glass',
    description:
      'Beakers and straight tubes in classic and iridescent finishes, from everyday glass to statement pieces.',
    match: (t) =>
      /beaker|straight|water pipe|\bstack\b|2 da dome|flame|mighty mini/.test(t),
  },
  {
    handle: 'rigs',
    title: 'Rigs',
    group: 'Glass',
    description: 'Small-volume rigs built for concentrate, not flower.',
    match: (t) => /\brig\b/.test(t),
  },
  {
    handle: 'recyclers',
    title: 'Recyclers',
    group: 'Glass',
    description:
      'Incyclers, flowcyclers and doublecyclers. Continuous filtration, cooler draw.',
    match: (t) => /cycler/.test(t),
  },
  {
    handle: 'bubblers',
    title: 'Bubblers',
    group: 'Glass',
    description: 'Pocket-scale water filtration.',
    match: (t) => /bubbler/.test(t),
  },
  {
    handle: 'hand-pipes',
    title: 'Hand Pipes',
    group: 'Glass',
    description: 'Spoons, chillums and pocket hitters in worked and solid colour.',
    match: (t) =>
      /hand pipe|chillum|bk pipe|mini mallet|twisted nectar|pocket hitter|bite pipe|toke deck|vortex/.test(t),
  },
  {
    handle: 'bowls',
    title: 'Bowls & Downstems',
    group: 'Glass',
    description: 'Replacement bowls and twist downstems in 4 and 5 inch.',
    match: (t) => /\bbowl\b|downstem/.test(t),
  },
  {
    handle: 'silicone',
    title: 'Silicone',
    group: 'Glass',
    description: 'Unbreakable, packable, and easy to clean.',
    match: (t) => /silicone/.test(t),
  },

  // --- Cookies quartz (branded bangers live here as well as in Cookies) ---
  {
    handle: 'quartz-bangers',
    title: 'Quartz Bangers',
    group: 'Glasshouse Quartz',
    description:
      'Standalone bangers and slurpers, including the Cookies gold and diamond series.',
    match: (t) => /\bbanger$|slurper|drip banger|gold banger|diamond banger/.test(t),
  },
];

/** Brand collections, matched on title prefix rather than keyword. */
const BRAND_RULES = [
  {
    handle: 'cookies',
    title: 'Cookies',
    group: 'Collaborations',
    description:
      'The full licensed Cookies range: water pipes, cyclers, quartz, hand pipes and accessories.',
    match: (t) => /^cookies?\b/.test(t),
  },
  {
    handle: 'glasshouse',
    title: 'Glasshouse Quartz',
    group: 'Collaborations',
    description:
      'Our own line. Full-weld quartz and borosilicate, made to be used daily.',
    match: (t) => !/^cookies?\b/.test(t),
  },
];

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

const money = (v) => {
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
};

/** Strips Shopify's CDN size suffix so we can request our own dimensions. */
const cleanImage = (src) =>
  String(src || '')
    .replace(/^http:/, 'https:')
    .replace(/(_\d+x\d*|_\d*x\d+|_(grande|large|medium|small|compact|icon|thumb|pico))(?=\.[a-z]+(\?|$))/i, '');

const stripHtml = (html) =>
  String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

/* ------------------------------------------------------------------ *
 * Build
 * ------------------------------------------------------------------ */

function build() {
  const rawProducts = readJson(path.join(RAW, 'products.json')).products;
  const rawCollections = readJson(path.join(RAW, 'collections.json')).collections;

  // Real membership scraped from the live storefront, keyed by product handle.
  const liveMembership = new Map();
  const colDir = path.join(RAW, 'collections');
  if (fs.existsSync(colDir)) {
    for (const file of fs.readdirSync(colDir)) {
      const handle = file.replace(/\.json$/, '');
      for (const p of readJson(path.join(colDir, file)).products || []) {
        if (!liveMembership.has(p.handle)) liveMembership.set(p.handle, new Set());
        liveMembership.get(p.handle).add(handle);
      }
    }
  }

  // Descriptions written by the shop owner, worth preserving.
  const sourceDescriptions = new Map(
    rawCollections.map((c) => [c.handle, stripHtml(c.body_html)]),
  );

  const products = [];
  const membership = new Map(); // collection handle -> ordered product handles

  const addTo = (colHandle, productHandle) => {
    if (!membership.has(colHandle)) membership.set(colHandle, []);
    const list = membership.get(colHandle);
    if (!list.includes(productHandle)) list.push(productHandle);
  };

  for (const p of rawProducts) {
    const title = p.title.replace(/\s+/g, ' ').trim();
    const key = title.toLowerCase();

    const images = (p.images || []).map((img, i) => ({
      src: cleanImage(img.src),
      alt: img.alt || `${title} — view ${i + 1}`,
      width: img.width || null,
      height: img.height || null,
      position: img.position ?? i + 1,
    }));

    const variants = (p.variants || []).map((v) => ({
      id: String(v.id),
      sku: v.sku || null,
      title: v.title,
      price: money(v.price),
      compareAtPrice: money(v.compare_at_price),
      available: v.available !== false,
      option1: v.option1 ?? null,
      option2: v.option2 ?? null,
      option3: v.option3 ?? null,
      position: v.position ?? 1,
    }));

    const prices = variants.map((v) => v.price).filter((n) => typeof n === 'number');
    const options = (p.options || [])
      .filter((o) => !(o.name === 'Title' && o.values?.length === 1 && o.values[0] === 'Default Title'))
      .map((o) => ({ name: o.name, values: o.values || [] }));

    const brand = /^cookies?\b/.test(key) ? 'Cookies' : 'Glasshouse';

    const product = {
      handle: p.handle,
      title,
      brand,
      descriptionHtml: p.body_html || '',
      description: stripHtml(p.body_html),
      images,
      options,
      variants,
      priceMin: prices.length ? Math.min(...prices) : null,
      priceMax: prices.length ? Math.max(...prices) : null,
      available: variants.some((v) => v.available),
      tags: p.tags || [],
      publishedAt: p.published_at || p.created_at || null,
      collections: [],
    };

    // 1. Honour real storefront membership.
    for (const h of liveMembership.get(p.handle) || []) {
      const normalised = h === 'trippy-edition-flattop-collection' ? 'etched-bangers'
        : h === 'glass-house-banger-hanger' ? 'banger-hangers'
        : h === 'glasshouse-ash-catchers' ? 'ash-catchers'
        : h === 'glasshouse-cups' ? 'banger-kits'
        : h === 'glasshouse-terp-kits' ? 'terp-pearls'
        : h.startsWith('cookies-') ? null // brand sub-collections are rebuilt below
        : h;
      if (normalised) product.collections.push(normalised);
    }

    // 2. Derive from title so nothing is orphaned.
    for (const rule of CATEGORY_RULES) {
      if (rule.match(key)) product.collections.push(rule.handle);
    }
    for (const rule of BRAND_RULES) {
      if (rule.match(key)) product.collections.push(rule.handle);
    }

    product.collections = [...new Set(product.collections)];
    for (const c of product.collections) addTo(c, p.handle);
    products.push(product);
  }

  // Assemble collections, newest-first inside each.
  const defs = [...CATEGORY_RULES, ...BRAND_RULES];
  const collections = defs
    .map((def, i) => {
      const handles = membership.get(def.handle) || [];

      // Cover art: most of this catalog is clear glass shot on a white sweep,
      // which vanishes on a pale page. Prefer a product that comes in colours,
      // then one with a deep gallery (a piece the shop photographed properly),
      // before falling back to whatever is first.
      const candidates = products.filter((p) => handles.includes(p.handle) && p.images.length);
      const cover =
        candidates
          .slice()
          .sort((a, b) => {
            const colour = (p) =>
              p.options.some((o) => /colou?r/i.test(o.name) && o.values.length > 2) ? 1 : 0;
            return colour(b) - colour(a) || b.images.length - a.images.length;
          })[0] ?? candidates[0];

      return {
        handle: def.handle,
        title: def.title,
        group: def.group,
        description: sourceDescriptions.get(def.handle) || def.description,
        image: cover?.images[0]?.src ?? null,
        productHandles: handles,
        count: handles.length,
        sortOrder: i,
      };
    })
    .filter((c) => c.count > 0);

  const orphans = products.filter((p) => p.collections.length === 0);

  const catalog = {
    generatedAt: new Date().toISOString(),
    source: 'data/raw (Shopify export, glasshousequartz.com)',
    counts: {
      products: products.length,
      collections: collections.length,
      variants: products.reduce((n, p) => n + p.variants.length, 0),
      images: products.reduce((n, p) => n + p.images.length, 0),
      orphans: orphans.length,
    },
    collections,
    products,
  };

  fs.writeFileSync(OUT, JSON.stringify(catalog, null, 2));

  console.log(`catalog -> ${path.relative(ROOT, OUT)}`);
  console.log(
    `  ${catalog.counts.products} products, ${catalog.counts.variants} variants, ` +
      `${catalog.counts.images} images, ${catalog.counts.collections} collections`,
  );
  for (const c of collections) {
    console.log(`   ${String(c.count).padStart(3)}  ${c.group.padEnd(18)} ${c.handle}`);
  }
  if (orphans.length) {
    console.log(`\n  WARNING ${orphans.length} product(s) matched no collection:`);
    for (const o of orphans) console.log(`     - ${o.title}`);
    process.exitCode = 1;
  } else {
    console.log('\n  No orphaned products. Every product is reachable from navigation.');
  }
}

build();
