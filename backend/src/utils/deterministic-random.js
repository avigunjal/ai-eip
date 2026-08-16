// Deterministic pseudo-random helpers.
// Used to generate stable chart history (project health trend) without storing
// snapshot rows or depending on the clock.

// mulberry32: tiny seeded PRNG used by the frontend fixtures too, so the
// backend can reproduce the same stable series for a given seed.
function mulberry32(seed) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A deterministic 12-point series that wanders around `base`, e.g. a health
// trend. Same seed always produces the same series.
export function deterministicSeries(seed, base, points = 12, amplitude = 6) {
  const random = mulberry32(seed);
  const clamp = (value) => Math.max(15, Math.min(100, Math.round(value)));
  const series = [];
  let current = base;
  for (let index = 0; index < points; index += 1) {
    current = clamp(current + (random() * 2 - 1) * amplitude);
    series.push(current);
  }
  return series;
}

// Stable "color-like" value derived from an id, used for avatar colors.
export function deterministicHue(seed) {
  const random = mulberry32(seed);
  return Math.floor(random() * 360);
}

export function initialsOf(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}