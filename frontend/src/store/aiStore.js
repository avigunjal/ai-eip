import { create } from 'zustand';
import { fetchAiSettings } from '../api/ai.js';

/**
 * Global AI settings (enabled state) loaded once at shell mount and shared by
 * SparkleIcon and other AI surfaces so the whole UI flips to a disabled look
 * when AI is turned off in Settings — without each component fetching.
 */
let loadPromise = null;

export const useAiStore = create((set) => ({
  aiSettings: null,
  aiLoadError: false,
  loadAiSettings: () => {
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
      try {
        const settings = await fetchAiSettings();
        set({ aiSettings: settings, aiLoadError: false });
      } catch {
        set({ aiLoadError: true });
      } finally {
        loadPromise = null;
      }
    })();
    return loadPromise;
  },
  setAiSettings: (settings) => set({ aiSettings: settings, aiLoadError: false }),
}));

/** Optimistically true until settings load, matching previous default behaviour. */
export const useAiEnabled = () => useAiStore((s) => s.aiSettings?.enabled ?? true);
