import { keyframes } from '@emotion/react';

/**
 * Shared animation keyframes for AI-EIP micro-interactions.
 *
 * Deliberately small set, applied only where it reinforces intelligence or
 * action (per the hackathon polish review) — never background/full-screen
 * motion. All animations respect `prefers-reduced-motion` via tokens.css.
 */

/** Fade in with a 10px upward slide — used when AI explanation content appears. */
export const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

/** Slide down + fade in — used when the disclosure expands with an AI result. */
export const expandDown = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
`;

/** Brief highlight of a section (evidence) after an AI explanation lands. */
export const highlightFlash = keyframes`
  0%, 100% { background-color: transparent; }
  25%, 75% { background-color: var(--primary-lighter); }
`;

/** Simple fade in. */
export const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

/** Slow breathing pulse (3s) — attention without blinking. */
export const slowPulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
`;

/** Red glow pulse for the risk node — "this relationship is causing attention". */
export const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 1px var(--red-lighter), 0 8px 24px rgba(209, 67, 67, 0.10); }
  50% { box-shadow: 0 0 0 1px var(--red-lighter), 0 8px 30px rgba(209, 67, 67, 0.30); }
`;

/** Subtle AI sparkle rotation for AI action buttons (every 5s). */
export const sparkleSpin = keyframes`
  0%, 88%, 100% { transform: rotate(0deg) scale(1); }
  93% { transform: rotate(45deg) scale(1.12); }
  97% { transform: rotate(-8deg) scale(1); }
`;

/** Moving dot along a relationship edge (offset-path travel). */
export const dotTravel = keyframes`
  from { offset-distance: 0%; opacity: 0.95; }
  85% { opacity: 0.4; }
  to { offset-distance: 100%; opacity: 0.95; }
`;