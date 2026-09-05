'use client';

import { useEffect, useState } from 'react';

/**
 * Rotates one message at a time. All messages are in the DOM so the strip
 * never changes height, and the inactive ones are hidden from assistive tech
 * rather than only visually.
 */
export default function AnnouncementBar({ items }: { items: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) return;

    const id = window.setInterval(() => setIndex((i) => (i + 1) % items.length), 5000);
    return () => window.clearInterval(id);
  }, [items.length]);

  return (
    <div className="border-b border-line bg-ink text-white">
      <div className="u-container relative flex h-9 items-center justify-center">
        {items.map((item, i) => (
          <p
            key={item}
            aria-hidden={i !== index}
            className={`absolute text-center text-[0.6875rem] uppercase tracking-[0.16em] transition-opacity duration-700 ${
              i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}
