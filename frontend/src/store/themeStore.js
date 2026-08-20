import { create } from 'zustand';

/**
 * Active visual theme variant. Persisted to localStorage so the choice
 * survives reloads. 'moss' (warm) is the default; 'classic' restores the
 * original pre-moss look. The ThemeProvider keeps document.documentElement's
 * data-theme attribute in sync with this store (drives the CSS tokens), and
 * rebuilds the MUI theme to match.
 */
const KEY = 'aieip:theme';

const readInitial = () => {
  try {
    return localStorage.getItem(KEY) === 'classic' ? 'classic' : 'moss';
  } catch {
    return 'moss';
  }
};

export const useThemeStore = create((set) => ({
  variant: readInitial(),
  setVariant: (variant) => {
    try {
      localStorage.setItem(KEY, variant);
    } catch {
      /* storage unavailable — keep in-memory only */
    }
    set({ variant });
  },
}));