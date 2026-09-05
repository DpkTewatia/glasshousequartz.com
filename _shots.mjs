import { chromium } from 'playwright';
import path from 'node:path';

const OUT = process.argv[2];
const BASE = 'http://localhost:3111';

const shots = [
  { name: 'home-desktop', url: '/', w: 1440, h: 1000, full: true },
  { name: 'collection', url: '/collections/banger-hangers', w: 1440, h: 1000, full: false },
  { name: 'product', url: '/products/glasshouse-crusher', w: 1440, h: 1100, full: false },
  { name: 'home-mobile', url: '/', w: 390, h: 844, full: false },
  { name: 'about', url: '/pages/about', w: 1440, h: 1000, full: false },
];

const browser = await chromium.launch();
const errors = [];

for (const s of shots) {
  const ctx = await browser.newContext({
    viewport: { width: s.w, height: s.h },
    deviceScaleFactor: 1,
  });
  // Skip the age gate the way a returning visitor would.
  await ctx.addInitScript(() => {
    try { window.localStorage.setItem('ghq_age_ok', '1'); } catch {}
  });
  const page = await ctx.newPage();

  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${s.name}] console: ${m.text().slice(0, 200)}`);
  });
  page.on('pageerror', (e) => errors.push(`[${s.name}] pageerror: ${String(e).slice(0, 200)}`));
  page.on('requestfailed', (r) => {
    const u = r.url();
    if (!u.startsWith('data:')) errors.push(`[${s.name}] failed: ${u.slice(0, 140)}`);
  });

  await page.goto(BASE + s.url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, s.name + '.png'), fullPage: s.full });
  console.log('shot', s.name);
  await ctx.close();
}

await browser.close();

if (errors.length) {
  console.log('\n--- BROWSER ISSUES ---');
  for (const e of [...new Set(errors)]) console.log(e);
} else {
  console.log('\nNo console errors, page errors, or failed requests.');
}
