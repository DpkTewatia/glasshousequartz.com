import type { Cents } from './types';

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

/** Formats integer cents as USD. `formatMoney(5999)` -> "$59.99" */
export function formatMoney(cents: Cents | null | undefined): string {
  if (cents == null || !Number.isFinite(cents)) return '—';
  return usd.format(cents / 100);
}

/**
 * Products with per-variant pricing show a range. When every variant costs the
 * same we show a single price rather than "$59.99 – $59.99".
 */
export function formatPriceRange(min: Cents | null, max: Cents | null): string {
  if (min == null) return '—';
  if (max == null || max === min) return formatMoney(min);
  return `${formatMoney(min)} – ${formatMoney(max)}`;
}

/** Percentage off, rounded. Returns null when there is no genuine discount. */
export function discountPercent(price: Cents, compareAt: Cents | null): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}
