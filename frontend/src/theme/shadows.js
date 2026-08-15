// Aurora-inspired soft shadows. Shadow 0 is "none"; menus/drawers get the
// strongest shadow; cards rely primarily on a 1px outline (see components).
const shadows = [
  'none',
  '0 1px 3px rgba(23, 32, 51, 0.05), 0 1px 2px rgba(23, 32, 51, 0.04)', // card hover
  '0 1px 2px rgba(23, 32, 51, 0.04), 0 2px 4px rgba(23, 32, 51, 0.04)',
  '0 2px 8px rgba(23, 32, 51, 0.06)',
  '0 4px 12px rgba(23, 32, 51, 0.07)',
  '0 8px 24px rgba(23, 32, 51, 0.08)', // float / popover
  '0 8px 24px rgba(23, 32, 51, 0.10), 0 4px 12px rgba(23, 32, 51, 0.06)',
  '0 12px 32px rgba(23, 32, 51, 0.12), 0 6px 16px rgba(23, 32, 51, 0.08)', // drawer
  '0 16px 40px rgba(23, 32, 51, 0.14)',
  '0 20px 48px rgba(23, 32, 51, 0.16)',
];

// Fill the MUI shadow array out to 25 entries as MUI expects.
while (shadows.length < 25) shadows.push('none');

export default shadows;
