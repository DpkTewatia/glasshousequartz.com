import type { CSSProperties } from 'react';
import type { ProductImage } from './types';

/**
 * Dissolves the visible edge of a product photo into the panel behind it.
 *
 * Photos are drawn `object-contain object-bottom`, so one whose shape differs
 * from its panel leaves a band of bare panel — above it when the photo is
 * wider than the panel, either side when it is narrower. The photos carry
 * their own studio backdrop, which never quite matches the panel, so that
 * boundary shows as a hard line. A mask that fades the photo in over the
 * first few percent past the boundary removes the line without touching the
 * object in the middle of the frame.
 *
 * `aspect` and `panelAspect` are width / height. Returns nothing when the
 * photo fills the panel or its size is unknown.
 */
export function seamFade(
  aspect: number | null | undefined,
  panelAspect = 1,
): CSSProperties | undefined {
  if (!aspect || !Number.isFinite(aspect)) return undefined;

  let mask: string;
  if (aspect > panelAspect * 1.02) {
    const top = (1 - panelAspect / aspect) * 100;
    mask = `linear-gradient(to bottom, transparent ${top.toFixed(1)}%, #000 ${(top + 10).toFixed(1)}%)`;
  } else if (aspect < panelAspect / 1.02) {
    const side = ((1 - aspect / panelAspect) / 2) * 100;
    mask = `linear-gradient(to right, transparent ${side.toFixed(1)}%, #000 ${(side + 8).toFixed(1)}%, #000 ${(92 - side).toFixed(1)}%, transparent ${(100 - side).toFixed(1)}%)`;
  } else {
    return undefined;
  }

  return { maskImage: mask, WebkitMaskImage: mask };
}

export const imageAspect = (image: ProductImage | undefined): number | null =>
  image?.width && image?.height ? image.width / image.height : null;
