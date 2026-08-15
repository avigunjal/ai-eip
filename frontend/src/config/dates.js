import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { DEFAULT_DATE_RANGE, DATE_RANGES } from './constants.js';

dayjs.extend(relativeTime);

/** Format a date like "12 Aug 2026". */
export function formatDate(value, fmt = 'D MMM YYYY') {
  return dayjs(value).format(fmt);
}

/** Format a short date like "12 Aug". */
export function formatShortDate(value) {
  return dayjs(value).format('D MMM');
}

/** Relative time, e.g. "3 days ago". */
export function formatRelative(value) {
  return dayjs(value).fromNow();
}

/** Range label from a key (7d / 30d / 90d / custom). */
export function rangeLabel(key = DEFAULT_DATE_RANGE) {
  const match = DATE_RANGES.find((r) => r.key === key);
  return match?.label ?? 'Last 30 days';
}

/** Days for a range key. */
export function rangeDays(key = DEFAULT_DATE_RANGE) {
  const match = DATE_RANGES.find((r) => r.key === key);
  return match?.days ?? 30;
}

/** ISO start/end for a range key relative to `now`. */
export function rangeBounds(key = DEFAULT_DATE_RANGE, now = new Date()) {
  const days = rangeDays(key);
  const end = dayjs(now);
  const start = end.subtract(days - 1, 'day');
  return { start: start.startOf('day'), end: end.endOf('day') };
}
