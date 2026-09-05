import { chromium } from 'playwright';
const OUT = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => { try { localStorage.setItem('ghq_age_ok','1'); } catch {} });
const p = await ctx.newPage();
await p.goto('http://localhost:3111/', { waitUntil: 'networkidle' });
await p.waitForTimeout(1500);

const bands = await p.locator('section').all();
let i = 0;
for (const s of bands) {
  const txt = (await s.innerText().catch(() => '')).slice(0, 40).replace(/\s+/g, ' ');
  if (/Cookies range|Trippy Edition|Twenty years/.test(txt)) {
    await s.screenshot({ path: `${OUT}/band-${i}.png` });
    console.log(`band-${i}.png ->`, txt);
    i++;
  }
}
await b.close();
