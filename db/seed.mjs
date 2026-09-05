/**
 * Applies db/schema.sql, then loads data/catalog.json into MySQL.
 *
 * Idempotent: re-running replaces catalog rows without touching carts, orders,
 * newsletter subscribers or contact messages.
 *
 * Run:  npm run db:setup     (schema + seed)
 *       npm run db:seed      (seed only)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));
const withSchema = args.has('--schema');

// Load .env.local then .env, without adding a dependency for it.
for (const file of ['.env.local', '.env']) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const [, k, rawV] = m;
    if (process.env[k]) continue;
    process.env[k] = rawV.replace(/^["']|["']$/g, '');
  }
}

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error(
    'DATABASE_URL is not set.\n' +
      'Copy .env.example to .env.local and point it at your MySQL server, e.g.\n' +
      '  DATABASE_URL="mysql://user:password@127.0.0.1:3306/glasshousequartz"',
  );
  process.exit(1);
}

const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'catalog.json'), 'utf8'));

/** Splits SQL on semicolons that end a statement. */
function splitStatements(sql) {
  return sql
    .split('\n')
    .filter((l) => !l.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function main() {
  const conn = await mysql.createConnection({
    uri: url,
    multipleStatements: false,
    // DDL and large inserts need room.
    connectTimeout: 30_000,
  });

  const target = new URL(url).pathname.replace(/^\//, '') || '(default)';
  console.log(`connected -> ${target}`);

  if (withSchema) {
    const sql = fs.readFileSync(path.join(ROOT, 'db', 'schema.sql'), 'utf8');
    const statements = splitStatements(sql);
    for (const stmt of statements) await conn.query(stmt);
    console.log(`schema     applied (${statements.length} statements)`);
  }

  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const t of [
    'product_collections',
    'product_tags',
    'product_variants',
    'product_options',
    'product_images',
    'products',
    'collections',
  ]) {
    await conn.query(`DELETE FROM ${t}`);
  }
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');

  // --- collections ---
  for (const c of catalog.collections) {
    await conn.execute(
      `INSERT INTO collections (handle, title, \`group\`, description, image, sort_order, product_count)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [c.handle, c.title, c.group, c.description || null, c.image, c.sortOrder, c.count],
    );
  }
  console.log(`collections ${catalog.collections.length}`);

  // --- products and children ---
  let images = 0;
  let variants = 0;
  let links = 0;

  for (const p of catalog.products) {
    await conn.execute(
      `INSERT INTO products
         (handle, title, brand, description, description_html, price_min, price_max, available, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.handle,
        p.title,
        p.brand,
        p.description || null,
        p.descriptionHtml || null,
        p.priceMin,
        p.priceMax,
        p.available ? 1 : 0,
        p.publishedAt ? new Date(p.publishedAt) : null,
      ],
    );

    for (const img of p.images) {
      await conn.execute(
        `INSERT INTO product_images (product_handle, src, alt, width, height, position)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [p.handle, img.src, img.alt || null, img.width, img.height, img.position],
      );
      images++;
    }

    for (const [i, opt] of p.options.entries()) {
      await conn.execute(
        `INSERT INTO product_options (product_handle, name, values_json, position)
         VALUES (?, ?, ?, ?)`,
        [p.handle, opt.name, JSON.stringify(opt.values), i + 1],
      );
    }

    for (const v of p.variants) {
      await conn.execute(
        `INSERT INTO product_variants
           (id, product_handle, sku, title, price, compare_at_price, available,
            option1, option2, option3, position)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          v.id,
          p.handle,
          v.sku,
          v.title,
          v.price,
          v.compareAtPrice,
          v.available ? 1 : 0,
          v.option1,
          v.option2,
          v.option3,
          v.position,
        ],
      );
      variants++;
    }

    for (const [i, handle] of p.collections.entries()) {
      await conn.execute(
        `INSERT IGNORE INTO product_collections (product_handle, collection_handle, position)
         VALUES (?, ?, ?)`,
        [p.handle, handle, i],
      );
      links++;
    }

    for (const tag of p.tags) {
      await conn.execute('INSERT IGNORE INTO product_tags (product_handle, tag) VALUES (?, ?)', [
        p.handle,
        tag,
      ]);
    }
  }

  console.log(`products    ${catalog.products.length}`);
  console.log(`variants    ${variants}`);
  console.log(`images      ${images}`);
  console.log(`links       ${links}`);

  const [[check]] = await conn.query(
    `SELECT COUNT(*) AS orphans FROM products p
      WHERE NOT EXISTS (SELECT 1 FROM product_collections pc WHERE pc.product_handle = p.handle)`,
  );
  console.log(
    check.orphans === 0
      ? 'orphans     0 — every product is reachable from navigation'
      : `orphans     ${check.orphans} (products in no collection)`,
  );

  await conn.end();
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  process.exit(1);
});
