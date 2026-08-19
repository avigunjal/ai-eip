import { useEffect, useState } from 'react';

/**
 * Count-up for KPI values on first load.
 *
 * Parses the leading numeric portion of a value ("116%", "+14%", 67) and
 * animates it 0 → target with an ease-out curve. Non-numeric values are
 * returned unchanged. Only runs when `target` changes (i.e. once per mount).
 *
 * @param {string|number} target
 * @param {number} duration animation duration in ms
 * @returns {string} the animated value
 */
export function useCountUp(target, duration = 800) {
  const [display, setDisplay] = useState(() => String(target));

  useEffect(() => {
    const value = String(target);
    const match = value.match(/^([^0-9-]*)(-?\d+(?:\.\d+)?)(.*)$/);
    if (!match) {
      setDisplay(value);
      return undefined;
    }
    const [, pre, num, post] = match;
    const goal = parseFloat(num);
    if (!Number.isFinite(goal)) {
      setDisplay(value);
      return undefined;
    }

    let frame;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(`${pre}${Math.round(goal * eased)}${post}`);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return display;
}

/**
 * Numeric variant of the count-up, returning a number — for progress bars
 * (LinearProgress `value`) that should fill 0 → target on page load.
 */
export function useCountUpNumber(target, duration = 800) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const goal = Number(target) || 0;
    if (!Number.isFinite(goal)) {
      setDisplay(0);
      return undefined;
    }
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(goal * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return display;
}