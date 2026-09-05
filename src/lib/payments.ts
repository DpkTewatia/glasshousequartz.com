import 'server-only';
import type { Cart } from './types';

/**
 * Payment boundary.
 *
 * Moving off Shopify means giving up its checkout, and checkout is the one
 * part of a store you should not hand-roll: card data, PCI DSS scope, 3-D
 * Secure, tax and shipping rates, fraud rules, chargebacks. None of that
 * belongs in this repo.
 *
 * So the storefront owns cart and order records, and delegates the money to a
 * provider behind this interface. Nothing above this file knows which provider
 * is in use, and no card data ever touches our server: a provider returns a
 * redirect URL (hosted checkout) or a client secret (embedded fields), and the
 * browser talks to the provider directly.
 *
 * To go live, implement `PaymentProvider` for Stripe Checkout — roughly:
 *
 *   const session = await stripe.checkout.sessions.create({
 *     mode: 'payment',
 *     line_items: cart.lines.map(l => ({
 *       quantity: l.quantity,
 *       price_data: {
 *         currency: 'usd',
 *         unit_amount: l.variant.price,          // already in cents
 *         product_data: { name: `${l.product.title} — ${l.variant.title}` },
 *       },
 *     })),
 *     success_url: `${origin}/checkout/confirmation?session_id={CHECKOUT_SESSION_ID}`,
 *     cancel_url:  `${origin}/cart`,
 *   });
 *   return { kind: 'redirect', url: session.url, reference: session.id };
 *
 * then mark the order paid from the `checkout.session.completed` webhook —
 * never from the browser returning to the success URL, which a customer can
 * forge or simply never reach.
 *
 * Note: card networks and most PSPs place smoking accessories under
 * restricted or high-risk categories. Confirm acceptance with the provider
 * before launch rather than after.
 */

export interface CheckoutRedirect {
  kind: 'redirect';
  url: string;
  reference: string;
}

export interface CheckoutClientSecret {
  kind: 'client_secret';
  clientSecret: string;
  reference: string;
}

export interface CheckoutUnavailable {
  kind: 'unavailable';
  reason: string;
}

export type CheckoutSession = CheckoutRedirect | CheckoutClientSecret | CheckoutUnavailable;

export interface PaymentProvider {
  readonly id: string;
  createCheckoutSession(input: { cart: Cart; email?: string; origin: string }): Promise<CheckoutSession>;
}

/**
 * The provider that ships with the repo. It deliberately cannot take money —
 * it exists so the whole flow up to the payment step is real and testable, and
 * so a missing configuration fails loudly instead of appearing to succeed.
 */
function createUnconfiguredProvider(): PaymentProvider {
  return {
    id: 'unconfigured',
    async createCheckoutSession() {
      return {
        kind: 'unavailable',
        reason:
          'No payment provider is configured. Implement PaymentProvider in src/lib/payments.ts ' +
          '(Stripe Checkout is the shortest path) and set PAYMENT_PROVIDER in your environment.',
      };
    },
  };
}

export function getPaymentProvider(): PaymentProvider {
  switch (process.env.PAYMENT_PROVIDER) {
    // case 'stripe': return createStripeProvider();
    default:
      return createUnconfiguredProvider();
  }
}

export const isCheckoutConfigured = (): boolean =>
  getPaymentProvider().id !== 'unconfigured';
