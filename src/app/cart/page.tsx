import type { Metadata } from 'next';
import CartContents from '@/components/commerce/CartContents';
import { isCheckoutConfigured } from '@/lib/payments';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Your Bag',
  robots: { index: false, follow: false },
};

export default function CartPage() {
  // Cart contents come from the client cart, so this page is a static shell —
  // no cookie read here, nothing per-visitor rendered on the server.
  return (
    <div className="u-container">
      <CartContents checkoutReady={isCheckoutConfigured()} supportEmail={SITE.email} />
    </div>
  );
}
