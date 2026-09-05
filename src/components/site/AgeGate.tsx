'use client';

import Link from 'next/link';
import { useEffect, useSyncExternalStore } from 'react';
import { SITE } from '@/lib/site';

const KEY = 'ghq_age_ok';

/* ------------------------------------------------------------------ *
 * localStorage as an external store
 * ------------------------------------------------------------------ *
 * The confirmation lives in the browser, which React cannot read while
 * rendering on the server. useSyncExternalStore is the primitive for exactly
 * this: `getServerSnapshot` returns "already confirmed" so the prerendered
 * HTML never contains a blocking overlay — good for crawlers, and it means
 * the static page is identical for everyone — while `getSnapshot` reads the
 * real value on the client and React re-renders once after hydration.
 */

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Another tab confirming should dismiss the gate here too.
  window.addEventListener('storage', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}

function getSnapshot(): boolean {
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    // Private browsing or blocked storage: ask again this session.
    return false;
  }
}

const getServerSnapshot = (): boolean => true;

/**
 * Age confirmation. Smoking accessories are age-restricted and every serious
 * retailer in this category gates the storefront.
 */
export default function AgeGate() {
  const confirmed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (confirmed) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [confirmed]);

  if (confirmed) return null;

  const accept = () => {
    try {
      window.localStorage.setItem(KEY, '1');
    } catch {
      /* Storage unavailable — the gate simply reappears next visit. */
    }
    for (const l of listeners) l();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-white/95 px-6 backdrop-blur-sm"
    >
      <div className="w-full max-w-md text-center animate-fade">
        <p className="u-label">{SITE.name}</p>
        <h2 id="age-gate-title" className="mt-6 font-display text-display-md">
          Are you 21 or older?
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-ink-500">
          You must be of legal age in your jurisdiction to enter this store. Our products are
          intended for use with legal substances only.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={accept} className="btn-ink px-10">
            Yes, I am 21+
          </button>
          <a href="https://www.google.com" className="btn-outline px-10">
            No
          </a>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-ink-400">
          By entering you agree to our{' '}
          <Link href="/pages/terms-and-conditions" className="link-draw text-ink">
            Terms &amp; Conditions
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
