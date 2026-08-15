// Typography scale (Inter). Mirrors the AI-EIP spec:
//  page title 28/36 700 · section title 18/26 700 · body 14/21 400
//  meta 13/18 400 · KPI number 32-36 700 · button 14 600.
const createTypography = () => ({
  fontFamily: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'].join(','),
  h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' }, // 40px
  h2: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.01em' }, // 32px
  h3: { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.286 }, // 28px
  h4: { fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3 }, // 20px
  h5: { fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.4 }, // 18px section title
  h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.4 }, // 16px
  subtitle1: { fontSize: '0.9375rem', fontWeight: 500, lineHeight: 1.4 },
  subtitle2: { fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.4 }, // meta label
  body1: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5 }, // 14px
  body2: { fontSize: '0.8125rem', fontWeight: 400, lineHeight: 1.5 }, // 13px meta
  button: { fontSize: '0.875rem', fontWeight: 600, textTransform: 'none', letterSpacing: '0' },
  caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.4 },
  overline: { fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' },
});

export default createTypography;
