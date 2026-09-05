'use client';

import { useEffect, useState } from 'react';
import { SITE } from '@/lib/site';

const KEY = 'ghq_age_ok';

/**
 * Age confirmation.
 *
 * Smoking accessories are age-restricted, and every serious retailer in this
 * category gates the storefront. The choice is kept in localStorage rather
 * than a cookie because it is a per-device preference, not something the
 * server needs.
 *
 * It renders nothing until mounted so the server and client markup agree, and
 * so search engine crawlers are never served a blocking overlay.
 */
export default function AgeGate() {
  const [state, setState] = useState<'pending' | 'open' | 'closed'>('pending');

  useEffect(() => {
    let confirmed = false;
    try {
      confirmed = window.localStorage.getItem(KEY) === '1';
    } catch {
      // Private browsing or blocked storage: ask again this session.
    }
    setState(confirmed ? 'closed' : 'open');
  }, []);

  useEffect(() => {
    if (state !== 'open') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [state]);

  if (state !== 'open') return null;

  const accept = () => {
    try {
      window.localStorage.setItem(KEY, '1');
    } catch {
      /* ignore */
    }
    setState('closed');
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
          <a href="/pages/terms-and-conditions" className="link-draw text-ink">
            Terms &amp; Conditions
          </a>
          .
        </p>
      </div>
    </div>
  );
}
