/**
 * Material 3 Expressive-style outlines as CSS polygons.
 * Every shape uses the same vertex count, which is what lets clip-path morph between any two.
 */
const N = 144;

const radii = {
  circle: () => 1,
  /** twelve soft scallops, like a wax seal */
  cookie12: (a: number) => 0.92 + 0.08 * Math.cos(12 * a),
  /** seven-lobed cookie */
  cookie7: (a: number) => 0.9 + 0.1 * Math.cos(7 * a),
  /** four rounded leaves */
  clover4: (a: number) => 0.7 + 0.3 * Math.abs(Math.cos(2 * a)) ** 0.55,
  /** eight short rays */
  sunny: (a: number) => 0.88 + 0.12 * Math.cos(8 * a) ** 3,
} as const;

export type ShapeName = keyof typeof radii;

const cache = new Map<ShapeName, string>();

export function shape(name: ShapeName): string {
  const hit = cache.get(name);
  if (hit) return hit;
  const r = radii[name];
  const pts = Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    const k = r(a);
    return `${(50 + 50 * k * Math.cos(a)).toFixed(2)}% ${(50 + 50 * k * Math.sin(a)).toFixed(2)}%`;
  });
  const v = `polygon(${pts.join(", ")})`;
  cache.set(name, v);
  return v;
}

/** Inline style for an element with class="shape". */
export const morph = (rest: ShapeName, alt: ShapeName) => `--shape-rest: ${shape(rest)}; --shape-alt: ${shape(alt)};`;
