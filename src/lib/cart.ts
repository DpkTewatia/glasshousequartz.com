import 'server-only';
import { cookies } from 'next/headers';
import { randomUUID } from 'node:crypto';
import { execute, isReachable, query, transaction } from './db';
import { getCatalog } from './catalog';
import type { Cart, CartLine, HydratedCartLine } from './types';

/**
 * Cart storage has two backends behind one API:
 *
 *   with MySQL     the cookie holds a cart id; lines live in `cart_lines`,
 *                  so a cart survives across devices once a customer logs in
 *                  and is visible to abandoned-cart tooling.
 *   without MySQL  the cookie holds the lines themselves.
 *
 * Callers never branch on which is active.
 *
 * Only variant ids and quantities are ever stored. Prices are always resolved
 * from the catalog at read time, so a stale cookie can never pin an old price.
 */

const COOKIE_ID = 'ghq_cart';
const COOKIE_LINES = 'ghq_cart_lines';
const MAX_QTY = 25;
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
};

/* ------------------------------------------------------------------ *
 * Raw line storage
 * ------------------------------------------------------------------ */

async function readLines(): Promise<CartLine[]> {
  const jar = await cookies();

  if (await isReachable()) {
    const id = jar.get(COOKIE_ID)?.value;
    if (!id) return [];
    try {
      const rows = await query<{ variant_id: string; product_handle: string; quantity: number }>(
        'SELECT variant_id, product_handle, quantity FROM cart_lines WHERE cart_id = ? ORDER BY id',
        [id],
      );
      return rows.map((r) => ({
        variantId: r.variant_id,
        productHandle: r.product_handle,
        quantity: r.quantity,
      }));
    } catch {
      return [];
    }
  }

  const raw = jar.get(COOKIE_LINES)?.value;
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((l): CartLine[] => {
      if (typeof l !== 'object' || l === null) return [];
      const { variantId, productHandle, quantity } = l as Record<string, unknown>;
      if (typeof variantId !== 'string' || typeof productHandle !== 'string') return [];
      const q = Number(quantity);
      if (!Number.isInteger(q) || q < 1) return [];
      return [{ variantId, productHandle, quantity: Math.min(q, MAX_QTY) }];
    });
  } catch {
    return [];
  }
}

async function writeLines(lines: CartLine[]): Promise<void> {
  const jar = await cookies();

  if (await isReachable()) {
    let id = jar.get(COOKIE_ID)?.value;
    if (!id) {
      id = randomUUID();
      jar.set(COOKIE_ID, id, COOKIE_OPTS);
    }
    const cartId = id;
    await transaction(async (conn) => {
      await conn.execute('INSERT IGNORE INTO carts (id) VALUES (?)', [cartId]);
      await conn.execute('DELETE FROM cart_lines WHERE cart_id = ?', [cartId]);
      for (const l of lines) {
        await conn.execute(
          'INSERT INTO cart_lines (cart_id, variant_id, product_handle, quantity) VALUES (?, ?, ?, ?)',
          [cartId, l.variantId, l.productHandle, l.quantity],
        );
      }
      await conn.execute('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [cartId]);
    });
    return;
  }

  jar.set(COOKIE_LINES, JSON.stringify(lines), COOKIE_OPTS);
}

/* ------------------------------------------------------------------ *
 * Public API
 * ------------------------------------------------------------------ */

/** Hydrates stored lines against the live catalog, dropping anything stale. */
export async function getCart(): Promise<Cart> {
  const [lines, catalog] = await Promise.all([readLines(), getCatalog()]);
  const jar = await cookies();

  const hydrated: HydratedCartLine[] = [];
  for (const line of lines) {
    const product = catalog.products.find((p) => p.handle === line.productHandle);
    const variant = product?.variants.find((v) => v.id === line.variantId);
    if (!product || !variant) continue; // product delisted since it was added
    hydrated.push({
      ...line,
      product,
      variant,
      lineTotal: variant.price * line.quantity,
    });
  }

  return {
    id: jar.get(COOKIE_ID)?.value ?? 'local',
    lines: hydrated,
    subtotal: hydrated.reduce((n, l) => n + l.lineTotal, 0),
    count: hydrated.reduce((n, l) => n + l.quantity, 0),
  };
}

export async function addToCart(variantId: string, quantity = 1): Promise<void> {
  const catalog = await getCatalog();
  const product = catalog.products.find((p) => p.variants.some((v) => v.id === variantId));
  const variant = product?.variants.find((v) => v.id === variantId);
  if (!product || !variant) throw new Error(`Unknown variant: ${variantId}`);
  if (!variant.available) throw new Error(`${product.title} (${variant.title}) is sold out`);

  const lines = await readLines();
  const existing = lines.find((l) => l.variantId === variantId);
  const qty = Math.max(1, Math.trunc(quantity));

  if (existing) existing.quantity = Math.min(existing.quantity + qty, MAX_QTY);
  else lines.push({ variantId, productHandle: product.handle, quantity: Math.min(qty, MAX_QTY) });

  await writeLines(lines);
}

export async function setLineQuantity(variantId: string, quantity: number): Promise<void> {
  const lines = await readLines();
  const qty = Math.trunc(quantity);
  const next =
    qty <= 0
      ? lines.filter((l) => l.variantId !== variantId)
      : lines.map((l) => (l.variantId === variantId ? { ...l, quantity: Math.min(qty, MAX_QTY) } : l));
  await writeLines(next);
}

export async function removeFromCart(variantId: string): Promise<void> {
  await setLineQuantity(variantId, 0);
}

export async function clearCart(): Promise<void> {
  const jar = await cookies();
  if (await isReachable()) {
    const id = jar.get(COOKIE_ID)?.value;
    if (id) await execute('DELETE FROM cart_lines WHERE cart_id = ?', [id]);
  }
  jar.delete(COOKIE_LINES);
}
