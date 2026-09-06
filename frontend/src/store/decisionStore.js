import { create } from 'zustand';

/**
 * Session-only record of decisions the user has acted on ("Action planned").
 *
 * In-memory zustand store — deliberately not persisted and not synced to a
 * backend. Written by the decision workspace confirm flow, read by Screen 1
 * and Screen 2 so both stay consistent for the current session.
 */
export const useDecisionStore = create((set) => ({
  records: {},
  record: (decisionId, option) =>
    set((s) => ({
      records: {
        ...s.records,
        [decisionId]: {
          optionId: option.id,
          optionName: option.name,
          at: new Date().toISOString(),
        },
      },
    })),
}));

/** The recorded action for a decision, or null when it hasn't been acted on. */
export const useDecisionRecord = (decisionId) =>
  useDecisionStore((s) => s.records[decisionId] ?? null);