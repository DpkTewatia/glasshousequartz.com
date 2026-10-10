'use client';

/**
 * Image loader for every `next/image` on the site (wired up in next.config.ts).
 *
 * Product photography lives on Shopify's CDN, which resizes and re-encodes on
 * request and caches the result at the edge. Asking it directly for the exact
 * width, as WebP, means the browser gets a 20–50 KB file from a CDN node near
 * the visitor — rather than this server downloading a multi-megabyte original
 * and re-encoding it on the first view of every size.
 *
 * `format=webp` is explicit on purpose: left to choose, Shopify answers with
 * JPEG for a good share of the JPEG originals. It is a strong hint rather than
 * a guarantee, though — Shopify still reads the browser's Accept header, and
 * for some PNG originals it returns AVIF to browsers that take it. Those files
 * are no larger than the WebP would be.
 */
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!src.startsWith('https://cdn.shopify.com/')) {
    // Anything not on the Shopify CDN is served as it is.
    return `${src}${src.includes('?') ? '&' : '?'}w=${width}`;
  }

  const url = new URL(src);
  url.searchParams.set('width', String(width));
  url.searchParams.set('format', 'webp');
  url.searchParams.set('quality', String(quality ?? 75));
  return url.toString();
}
