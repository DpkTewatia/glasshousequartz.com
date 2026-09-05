'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface CartLineView {
  variantId: string;
  quantity: number;
  lineTotal: number;
  unitPrice: number;
  variantTitle: string;
  product: { handle: string; title: string; image: string | null; imageAlt: string };
}

export interface CartView {
  count: number;
  subtotal: number;
  lines: CartLineView[];
}

interface CartContextValue {
  cart: CartView;
  loading: boolean;
  ready: boolean;
  error: string | null;
  add: (variantId: string, quantity?: number) => Promise<boolean>;
  setQuantity: (variantId: string, quantity: number) => Promise<void>;
  remove: (variantId: string) => Promise<void>;
  openDrawer: () => void;
}

const EMPTY: CartView = { count: 0, subtotal: 0, lines: [] };

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}

/**
 * Holds cart state on the client so no server component in the layout has to
 * read cookies — which is what lets every product and collection page stay
 * static. The cart is fetched once after hydration and then kept in sync by
 * the mutation responses themselves, which return the new cart.
 */
export default function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartView>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/cart')
      .then((r) => (r.ok ? r.json() : EMPTY))
      .then((data: CartView) => {
        if (!cancelled) setCart(data);
      })
      .catch(() => {
        /* keep the empty cart; the badge simply shows 0 */
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const mutate = useCallback(async (body: Record<string, unknown>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data?.error === 'string' ? data.error : 'Could not update your bag.');
        return false;
      }
      setCart(data as CartView);
      return true;
    } catch {
      setError('Network problem — please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const openDrawer = useCallback(() => {
    const el = document.getElementById('cart-drawer');
    if (!el) return;
    // Bootstrap attaches its instance factory to the window global.
    const bs = (window as unknown as { bootstrap?: { Offcanvas: { getOrCreateInstance(e: Element): { show(): void } } } })
      .bootstrap;
    bs?.Offcanvas.getOrCreateInstance(el).show();
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      loading,
      ready,
      error,
      add: (variantId, quantity = 1) => mutate({ action: 'add', variantId, quantity }),
      setQuantity: async (variantId, quantity) => {
        await mutate({ action: 'set', variantId, quantity });
      },
      remove: async (variantId) => {
        await mutate({ action: 'remove', variantId });
      },
      openDrawer,
    }),
    [cart, loading, ready, error, mutate, openDrawer],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
