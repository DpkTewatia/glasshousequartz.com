'use client';

import { useCart } from './CartProvider';

export default function CartButton() {
  const { cart, ready } = useCart();

  return (
    <button
      type="button"
      className="relative flex items-center gap-2 p-2.5 transition-opacity hover:opacity-60"
      data-bs-toggle="offcanvas"
      data-bs-target="#cart-drawer"
      aria-controls="cart-drawer"
      aria-label={ready ? `Bag, ${cart.count} item${cart.count === 1 ? '' : 's'}` : 'Bag'}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          d="M3.25 5.5h11.5l-.85 10.25H4.1L3.25 5.5Z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <path
          d="M6.5 7.5V5a2.5 2.5 0 0 1 5 0v2.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
      {/* Reserve the digit's width so the header never shifts on hydration. */}
      <span className="min-w-[1ch] text-label-lg tabular-nums" aria-hidden="true">
        {ready ? cart.count : ''}
      </span>
    </button>
  );
}
