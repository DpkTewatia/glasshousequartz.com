'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from './CartProvider';
import { formatMoney } from '@/lib/money';
import { SHIPPING_THRESHOLD_CENTS } from '@/lib/site';

export default function CartDrawer() {
  const { cart, ready, loading, error, setQuantity, remove } = useCart();

  const remaining = Math.max(0, SHIPPING_THRESHOLD_CENTS - cart.subtotal);
  const progress = Math.min(100, (cart.subtotal / SHIPPING_THRESHOLD_CENTS) * 100);

  return (
    <div className="offcanvas offcanvas-end" tabIndex={-1} id="cart-drawer" aria-labelledby="cart-title">
      <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-line px-6">
        <h2 id="cart-title" className="u-label">
          Bag {cart.count > 0 && <span className="text-ink">({cart.count})</span>}
        </h2>
        <button type="button" className="-mr-2 p-2" data-bs-dismiss="offcanvas" aria-label="Close bag">
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </button>
      </div>

      {!ready ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="u-label">Loading…</p>
        </div>
      ) : cart.lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <p className="font-display text-2xl">Your bag is empty</p>
          <p className="mt-3 max-w-[24ch] text-sm leading-relaxed text-ink-500">
            Start with a full-weld banger kit — cap and pearls included.
          </p>
          <Link href="/collections/banger-kits" data-bs-dismiss="offcanvas" className="btn-ink mt-8">
            Shop banger kits
          </Link>
        </div>
      ) : (
        <>
          <div className="shrink-0 border-b border-line px-6 py-4">
            {remaining > 0 ? (
              <p className="text-xs text-ink-500">
                <span className="text-ink">{formatMoney(remaining)}</span> away from free shipping
              </p>
            ) : (
              <p className="text-xs text-ink">You have earned free shipping</p>
            )}
            <div className="mt-2 h-px w-full bg-line" aria-hidden="true">
              <div className="h-px bg-ink transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <ul className={`flex-1 overflow-y-auto px-6 transition-opacity ${loading ? 'opacity-50' : ''}`}>
            {cart.lines.map((line) => (
              <li key={line.variantId} className="flex gap-4 border-b border-line-soft py-5">
                <Link
                  href={`/products/${line.product.handle}`}
                  data-bs-dismiss="offcanvas"
                  className="media-panel relative aspect-square w-20 shrink-0 overflow-hidden"
                >
                  {line.product.image && (
                    <Image
                      src={line.product.image}
                      alt={line.product.imageAlt}
                      fill
                      sizes="80px"
                      className="object-contain object-bottom"
                    />
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    href={`/products/${line.product.handle}`}
                    data-bs-dismiss="offcanvas"
                    className="text-sm leading-snug"
                  >
                    {line.product.title}
                  </Link>
                  {line.variantTitle !== 'Default Title' && (
                    <p className="mt-1 text-xs text-ink-500">{line.variantTitle}</p>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center border border-line">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => setQuantity(line.variantId, line.quantity - 1)}
                        className="px-2.5 py-1 text-sm leading-none text-ink-500 transition-colors hover:text-ink disabled:opacity-40"
                        aria-label={`Decrease quantity of ${line.product.title}`}
                      >
                        −
                      </button>
                      <span className="min-w-[2ch] text-center text-xs tabular-nums">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => setQuantity(line.variantId, line.quantity + 1)}
                        className="px-2.5 py-1 text-sm leading-none text-ink-500 transition-colors hover:text-ink disabled:opacity-40"
                        aria-label={`Increase quantity of ${line.product.title}`}
                      >
                        +
                      </button>
                    </div>

                    <span className="text-sm tabular-nums">{formatMoney(line.lineTotal)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => remove(line.variantId)}
                  className="shrink-0 self-start p-1 text-ink-400 transition-colors hover:text-ink disabled:opacity-40"
                  aria-label={`Remove ${line.product.title} from bag`}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>

          <div className="shrink-0 border-t border-line px-6 py-5">
            {error && <p className="mb-3 text-xs text-sale">{error}</p>}
            <div className="flex items-baseline justify-between">
              <span className="u-label">Subtotal</span>
              <span className="text-lg tabular-nums">{formatMoney(cart.subtotal)}</span>
            </div>
            <p className="mt-1.5 text-xs text-ink-400">Shipping and taxes calculated at checkout.</p>
            <Link href="/cart" data-bs-dismiss="offcanvas" className="btn-ink mt-5 w-full">
              Review bag
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
