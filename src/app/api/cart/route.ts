import { NextResponse } from 'next/server';
import { z } from 'zod';
import { addToCart, getCart, removeFromCart, setLineQuantity } from '@/lib/cart';

/**
 * Cart API.
 *
 * The cart is the only per-visitor thing in the site chrome. Serving it from
 * here — rather than reading cookies inside the layout — keeps every product
 * and collection page statically renderable and CDN-cacheable, which is worth
 * far more than saving one fetch on load.
 *
 * Prices are never accepted from the client. The body carries a variant id and
 * a quantity; everything else is resolved server-side from the catalog.
 */

export const dynamic = 'force-dynamic';

/** Trimmed shape — the drawer needs a thumbnail and a title, not a full product. */
async function payload() {
  const cart = await getCart();
  return {
    count: cart.count,
    subtotal: cart.subtotal,
    lines: cart.lines.map((l) => ({
      variantId: l.variantId,
      quantity: l.quantity,
      lineTotal: l.lineTotal,
      unitPrice: l.variant.price,
      variantTitle: l.variant.title,
      product: {
        handle: l.product.handle,
        title: l.product.title,
        image: l.product.images[0]?.src ?? null,
        imageAlt: l.product.images[0]?.alt ?? '',
      },
    })),
  };
}

export async function GET() {
  return NextResponse.json(await payload(), {
    headers: { 'Cache-Control': 'no-store' },
  });
}

const mutation = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('add'),
    variantId: z.string().min(1).max(64),
    quantity: z.number().int().min(1).max(25).default(1),
  }),
  z.object({
    action: z.literal('set'),
    variantId: z.string().min(1).max(64),
    quantity: z.number().int().min(0).max(25),
  }),
  z.object({
    action: z.literal('remove'),
    variantId: z.string().min(1).max(64),
  }),
]);

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = mutation.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  try {
    const data = parsed.data;
    if (data.action === 'add') await addToCart(data.variantId, data.quantity);
    else if (data.action === 'set') await setLineQuantity(data.variantId, data.quantity);
    else await removeFromCart(data.variantId);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not update your bag.' },
      { status: 409 },
    );
  }

  return NextResponse.json(await payload(), {
    headers: { 'Cache-Control': 'no-store' },
  });
}
