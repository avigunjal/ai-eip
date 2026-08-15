import { create } from 'zustand';

/**
 * Global UI state that the shell touches but individual pages generally do not.
 * Kept tiny on purpose: zustand avoids the re-render churn and boilerplate
 * that a Context-per-concern approach would create at this scale.
 */
export const useUiStore = create((set, _get) => ({
  // mobile navigation drawer (sidebar on desktop is always visible)
  mobileNavOpen: false,
  toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
  openMobileNav: () => set({ mobileNavOpen: true }),
  closeMobileNav: () => set({ mobileNavOpen: false }),

  // command palette (⌘/Ctrl+K)
  commandPaletteOpen: false,
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),

  // last dismissed undo toast (id) so toasts don't stack duplicates
  lastUndo: null,
  setLastUndo: (id) => set({ lastUndo: id }),
}));
