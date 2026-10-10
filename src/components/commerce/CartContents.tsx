'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from './CartProvider';
import { formatMoney } from '@/lib/money';
import { SHIPPING_THRESHOLD_CENTS } from '@/lib/site';

/**
 * The bag page. Client-rendered from the same source as the header badge and
 * the drawer, so all three can never disagree about what is in the cart.
 */
export default function CartContents({
  checkoutReady,
  supportEmail,
}: {
  checkoutReady: boolean;
  supportEmail: string;
}) {
  const { cart, ready, loading, error, setQuantity, remove } = useCart();

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="u-label">Loading your bag…</p>
      </div>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center py-band text-center">
        <p className="u-label">Bag</p>
        <h1 className="mt-6 font-display text-display-md">Nothing in your bag yet.</h1>
        <p className="mt-4 max-w-[38ch] text-[0.9375rem] leading-relaxed text-ink-500">
          Banger kits arrive complete — cup, carb cap and terp pearls, sized to match.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Link href="/collections/banger-kits" className="btn-ink">
            Shop banger kits
          </Link>
          <Link href="/collections" className="btn-outline">
            All collections
          </Link>
        </div>
      </div>
    );
  }

  const freeShipping = cart.subtotal >= SHIPPING_THRESHOLD_CENTS;

  return (
    <div className="py-12 md:py-16">
      <h1 className="font-display text-display-md">
        Your bag <span className="text-ink-300">({cart.count})</span>
      </h1>

      <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
        <ul className={`transition-opacity lg:col-span-7 xl:col-span-8 ${loading ? 'opacity-50' : ''}`}>
          {cart.lines.map((line) => (
            <li
              key={line.variantId}
              className="grid grid-cols-[6rem_1fr] gap-5 border-b border-line py-6 first:border-t sm:grid-cols-[8rem_1fr]"
            >
              <Link
                href={`/products/${line.product.handle}`}
                className="media-panel relative aspect-square overflow-hidden"
              >
                {line.product.image && (
                  <Image
                    src={line.product.image}
                    alt={line.product.imageAlt}
                    fill
                    sizes="128px"
                    className="object-contain object-bottom"
                  />
                )}
              </Link>

              <div className="flex flex-col">
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <h2 className="text-[0.9375rem]">
                      <Link href={`/products/${line.product.handle}`} className="link-draw">
                        {line.product.title}
                      </Link>
                    </h2>
                    {line.variantTitle !== 'Default Title' && (
                      <p className="mt-1.5 text-sm text-ink-500">{line.variantTitle}</p>
                    )}
                    <p className="mt-1.5 text-sm text-ink-400">
                      {formatMoney(line.unitPrice)} each
                    </p>
                  </div>
                  <p className="shrink-0 text-[0.9375rem] tabular-nums">
                    {formatMoney(line.lineTotal)}
                  </p>
                </div>

                <div className="mt-auto flex items-center gap-6 pt-4">
                  <div className="flex items-center border border-line">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setQuantity(line.variantId, line.quantity - 1)}
                      className="px-3 py-1.5 text-ink-500 transition-colors hover:text-ink disabled:opacity-40"
                      aria-label={`Decrease quantity of ${line.product.title}`}
                    >
                      −
                    </button>
                    <span className="min-w-[2.5ch] text-center text-sm tabular-nums">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setQuantity(line.variantId, line.quantity + 1)}
                      className="px-3 py-1.5 text-ink-500 transition-colors hover:text-ink disabled:opacity-40"
                      aria-label={`Increase quantity of ${line.product.title}`}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => remove(line.variantId)}
                    className="text-xs text-ink-400 underline hover:text-ink disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:col-span-5 lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:self-start xl:col-span-4">
          <div className="border border-line p-7">
            <h2 className="u-label">Summary</h2>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">Subtotal</dt>
                <dd className="tabular-nums">{formatMoney(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Shipping</dt>
                <dd className="tabular-nums text-ink-500">
                  {freeShipping ? 'Free' : 'Calculated at checkout'}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex items-baseline justify-between border-t border-line pt-5">
              <span className="text-[0.9375rem]">Total</span>
              <span className="text-lg tabular-nums">{formatMoney(cart.subtotal)}</span>
            </div>

            {error && <p className="mt-4 text-xs text-sale">{error}</p>}

            {checkoutReady ? (
              <Link href="/checkout" className="btn-ink mt-7 w-full py-4">
                Checkout
              </Link>
            ) : (
              <>
                <button type="button" disabled className="btn-ink mt-7 w-full py-4">
                  Checkout
                </button>
                <p className="mt-4 border-t border-line pt-4 text-xs leading-relaxed text-ink-500">
                  Online checkout is not available yet. To place this order, email{' '}
                  <a href={`mailto:${supportEmail}`} className="link-draw text-ink">
                    {supportEmail}
                  </a>{' '}
                  and we will take it from there.
                </p>
              </>
            )}

            <Link href="/collections" className="btn-quiet mt-6 w-full justify-center">
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
