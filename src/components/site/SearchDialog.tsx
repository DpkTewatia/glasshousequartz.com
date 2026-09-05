'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';

const SUGGESTIONS = [
  'Banger kit',
  'Banger hanger',
  'Terp pearls',
  'Ash catcher',
  'Recycler',
  'Cookies beaker',
];

/**
 * Search panel. Submits to /search, which does the real work server-side —
 * this is only the entry point, so search still works with JS disabled via
 * the plain form action.
 */
export default function SearchDialog() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');

  // Focus the field when Bootstrap finishes opening the panel.
  useEffect(() => {
    const el = document.getElementById('search-panel');
    if (!el) return;
    const onShown = () => inputRef.current?.focus();
    el.addEventListener('shown.bs.offcanvas', onShown);
    return () => el.removeEventListener('shown.bs.offcanvas', onShown);
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    document.getElementById('search-panel')?.querySelector<HTMLElement>('[data-bs-dismiss]')?.click();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div
      className="offcanvas offcanvas-top"
      tabIndex={-1}
      id="search-panel"
      aria-labelledby="search-title"
      style={{ height: 'auto' }}
    >
      <div className="u-container py-10">
        <div className="flex items-start justify-between gap-8">
          <div className="w-full max-w-2xl">
            <h2 id="search-title" className="u-label">
              Search
            </h2>

            <form action="/search" method="get" onSubmit={submit} className="mt-4">
              <input
                ref={inputRef}
                name="q"
                type="search"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="What are you looking for?"
                aria-label="Search products"
                autoComplete="off"
                className="field !border-b-2 !py-4 text-2xl md:text-3xl"
              />
            </form>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              <span className="text-xs uppercase tracking-[0.14em] text-ink-400">Try</span>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setValue(s);
                    inputRef.current?.focus();
                  }}
                  className="text-sm text-ink-500 transition-colors hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button type="button" className="p-2" data-bs-dismiss="offcanvas" aria-label="Close search">
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
