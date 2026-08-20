// Aurora-inspired soft shadows. Shadow 0 is "none"; menus/drawers get the
// strongest shadow; cards rely primarily on a 1px outline (see components).
// Two variants share the same geometry but warm the base color per theme.
const build = (rgba) => [
  'none',
  `0 1px 3px ${rgba(0.05)}, 0 1px 2px ${rgba(0.04)}`, // card hover
  `0 1px 2px ${rgba(0.04)}, 0 2px 4px ${rgba(0.04)}`,
  `0 2px 8px ${rgba(0.06)}`,
  `0 4px 12px ${rgba(0.07)}`,
  `0 8px 24px ${rgba(0.08)}`, // float / popover
  `0 8px 24px ${rgba(0.10)}, 0 4px 12px ${rgba(0.06)}`,
  `0 12px 32px ${rgba(0.12)}, 0 6px 16px ${rgba(0.08)}`, // drawer
  `0 16px 40px ${rgba(0.14)}`,
  `0 20px 48px ${rgba(0.16)}`,
];

const moss = build((a) => `rgba(37, 39, 34, ${a})`);
const classic = build((a) => `rgba(23, 32, 51, ${a})`);

// Fill the MUI shadow arrays out to 25 entries as MUI expects.
const fill = (arr) => {
  const out = [...arr];
  while (out.length < 25) out.push('none');
  return out;
};

export const shadowsByVariant = {
  moss: fill(moss),
  classic: fill(classic),
};

export default shadowsByVariant.moss;