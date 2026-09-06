/**
 * Currency-aware value formatting.
 *
 * Amounts are stored as `{ value: number, currency: 'USD' }` so the platform
 * can render in any currency without touching decision data. Hackathon build
 * ships with USD; EUR/GBP/INR are supported by the same formatter.
 *
 *   USD 342000  → $342K        EUR 315000 → €315K
 *   GBP 270000  → £270K        INR 2870000 → ₹28.7L
 */

export const CURRENCY_SYMBOL = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };

/** 342000 → "$342K", 2870000 (INR) → "₹28.7L", 0 → "$0". */
export function formatCurrency(amount) {
  const currency = amount && CURRENCY_SYMBOL[amount.currency] ? amount.currency : 'USD';
  const symbol = CURRENCY_SYMBOL[currency];
  const value = Number(amount?.value);
  if (!Number.isFinite(value) || value === 0) return `${symbol}0`;

  const trim = (n) => (Number.isInteger(n) ? n : Math.round(n * 10) / 10);

  // Indian subcontinent uses lakh/crore notation.
  if (currency === 'INR') {
    if (value >= 1e7) return `${symbol}${trim(value / 1e7)}Cr`;
    if (value >= 1e5) return `${symbol}${trim(value / 1e5)}L`;
    return `${symbol}${value.toLocaleString('en-IN')}`;
  }

  if (value >= 1e6) return `${symbol}${trim(value / 1e6)}M`;
  if (value >= 1000) return `${symbol}${trim(value / 1000)}K`;
  return `${symbol}${value}`;
}