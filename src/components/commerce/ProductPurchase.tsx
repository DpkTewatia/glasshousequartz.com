'use client';

import { useMemo, useState } from 'react';
import { useCart } from './CartProvider';
import { discountPercent, formatMoney } from '@/lib/money';
import type { Product, ProductVariant } from '@/lib/types';

/**
 * Variant selection and add-to-bag.
 *
 * Selection is held as chosen option values rather than a variant id, so the
 * component can tell the difference between "this combination is sold out"
 * and "this combination does not exist" — and disable the impossible ones
 * instead of letting a customer pick a dead end.
 */

export default function ProductPurchase({ product }: { product: Product }) {
  const { add, loading, error, openDrawer } = useCart();
  const [added, setAdded] = useState(false);
  const hasOptions = product.options.length > 0;

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    // Start on the first variant that can actually be bought.
    const seed = product.variants.find((v) => v.available) ?? product.variants[0];
    const init: Record<string, string> = {};
    product.options.forEach((opt, i) => {
      const value = [seed?.option1, seed?.option2, seed?.option3][i];
      if (value) init[opt.name] = value;
    });
    return init;
  });

  const variant: ProductVariant | undefined = useMemo(() => {
    if (!hasOptions) return product.variants[0];
    return product.variants.find((v) =>
      product.options.every((opt, i) => {
        const value = [v.option1, v.option2, v.option3][i];
        return value === selected[opt.name];
      }),
    );
  }, [hasOptions, product.options, product.variants, selected]);

  /** Values that lead to at least one real variant, given the other choices. */
  const valueIsReachable = (optionName: string, value: string): boolean => {
    const probe = { ...selected, [optionName]: value };
    return product.variants.some((v) =>
      product.options.every((opt, i) => {
        const vv = [v.option1, v.option2, v.option3][i];
        return vv === probe[opt.name];
      }),
    );
  };

  const valueIsAvailable = (optionName: string, value: string): boolean => {
    const probe = { ...selected, [optionName]: value };
    return product.variants.some(
      (v) =>
        v.available &&
        product.options.every((opt, i) => {
          const vv = [v.option1, v.option2, v.option3][i];
          return vv === probe[opt.name];
        }),
    );
  };

  const price = variant?.price ?? product.priceMin ?? 0;
  const off = variant ? discountPercent(variant.price, variant.compareAtPrice) : null;
  const soldOut = !variant?.available;

  return (
    <div>
      {/* Price */}
      <div className="flex items-baseline gap-3">
        <p className="text-2xl tabular-nums">{formatMoney(price)}</p>
        {variant?.compareAtPrice && off && (
          <>
            <p className="text-base tabular-nums text-ink-400 line-through">
              {formatMoney(variant.compareAtPrice)}
            </p>
            <p className="text-label-lg uppercase text-sale">{off}% off</p>
          </>
        )}
      </div>

      {/* Options */}
      {hasOptions && (
        <div className="mt-9 space-y-7">
          {product.options.map((option) => (
            <fieldset key={option.name}>
              <legend className="u-label mb-3 flex w-full items-baseline justify-between">
                <span>{option.name}</span>
                <span className="normal-case tracking-normal text-ink">
                  {selected[option.name]}
                </span>
              </legend>

              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const reachable = valueIsReachable(option.name, value);
                  const available = valueIsAvailable(option.name, value);
                  const isSelected = selected[option.name] === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={!reachable}
                      aria-pressed={isSelected}
                      onClick={() => setSelected((s) => ({ ...s, [option.name]: value }))}
                      className={[
                        'border px-4 py-2.5 text-sm transition-colors duration-200',
                        isSelected
                          ? 'border-ink bg-ink text-white'
                          : 'border-line text-ink-700 hover:border-ink',
                        !reachable && 'cursor-not-allowed opacity-30',
                        reachable && !available && !isSelected && 'line-through opacity-50',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>
      )}

      {/* Add to bag */}
      <div className="mt-9">
        <button
          type="button"
          disabled={!variant || soldOut || loading}
          onClick={async () => {
            if (!variant) return;
            const ok = await add(variant.id, 1);
            if (ok) {
              setAdded(true);
              openDrawer();
            }
          }}
          className="btn-ink w-full py-4"
        >
          {loading
            ? 'Adding…'
            : !variant
              ? 'Unavailable'
              : soldOut
                ? 'Sold out'
                : 'Add to bag'}
        </button>
      </div>

      <p aria-live="polite" className="mt-3 min-h-[1.25rem] text-xs text-sale">
        {error ?? ''}
      </p>

      {added && !error && (
        <button type="button" onClick={openDrawer} className="btn-outline w-full py-4">
          View bag
        </button>
      )}
    </div>
  );
}
