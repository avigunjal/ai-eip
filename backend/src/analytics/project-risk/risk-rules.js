// Risk rules / thresholds. Centralize constants so they're not scattered.

export const RISK_RULES = {
  criticalThreshold: 80,
  highThreshold: 60,
  mediumThreshold: 40,
  signalWeights: {
    delayedPr: 0.3,
    blockedTicket: 0.4,
    reviewCoverage: 0.3,
  },
};
