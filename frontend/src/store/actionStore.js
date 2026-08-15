import { create } from 'zustand';

/**
 * Client state for undoable mock actions: watch project, dismiss/save insight,
 * send recognition, assign risk. All mutators are pure so UI can provide an
 * "Undo" toast that calls the inverse mutation.
 */
export const useActionStore = create((set, get) => ({
  watchedProjectIds: [],
  dismissedInsightIds: [],
  savedInsightIds: [],
  sentRecognitionIds: [],
  assignedRiskIds: [],

  // ---- watch project ----
  watchProject: (id) => set((s) => ({ watchedProjectIds: [...s.watchedProjectIds, id] })),
  unwatchProject: (id) =>
    set((s) => ({ watchedProjectIds: s.watchedProjectIds.filter((x) => x !== id) })),
  isWatched: (id) => get().watchedProjectIds.includes(id),
  toggleWatch: (id) =>
    get().isWatched(id) ? get().unwatchProject(id) : get().watchProject(id),

  // ---- insights ----
  dismissInsight: (id) => set((s) => ({ dismissedInsightIds: [...s.dismissedInsightIds, id] })),
  restoreInsight: (id) =>
    set((s) => ({ dismissedInsightIds: s.dismissedInsightIds.filter((x) => x !== id) })),
  saveInsight: (id) => set((s) => ({ savedInsightIds: [...s.savedInsightIds, id] })),
  unsaveInsight: (id) =>
    set((s) => ({ savedInsightIds: s.savedInsightIds.filter((x) => x !== id) })),
  isSaved: (id) => get().savedInsightIds.includes(id),

  // ---- recognition ----
  markRecognized: (id) => set((s) => ({ sentRecognitionIds: [...s.sentRecognitionIds, id] })),
  unmarkRecognized: (id) =>
    set((s) => ({ sentRecognitionIds: s.sentRecognitionIds.filter((x) => x !== id) })),
  isRecognized: (id) => get().sentRecognitionIds.includes(id),

  // ---- risk assignment ----
  assignRisk: (id) => set((s) => ({ assignedRiskIds: [...s.assignedRiskIds, id] })),
  unassignRisk: (id) =>
    set((s) => ({ assignedRiskIds: s.assignedRiskIds.filter((x) => x !== id) })),
  isAssigned: (id) => get().assignedRiskIds.includes(id),
}));
