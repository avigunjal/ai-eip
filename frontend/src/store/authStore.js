import { create } from 'zustand';
import { login, fetchAuthStatus } from '../api/auth.js';
import { getToken, setToken, clearToken } from '../auth/token.js';

/**
 * Global auth state: bootstrap (probe the backend), login, logout, and a
 * `status` driving the RequireAuth gate. While the backend is open (no
 * AUTH_PASSWORD configured) the app stays authenticated with the demo persona
 * so nothing changes in dev / the unconfigured demo deploy.
 */
const DEMO_USER = { name: 'Alex Chen', role: 'Engineering Manager' };

const SESSION_EXPIRED_EVENT = 'aieip:auth:expired';

export const useAuthStore = create((set, get) => ({
  status: 'idle', // idle | loading | authenticated | anonymous
  user: null,

  /** Probe the backend once. No-op after the first run. */
  bootstrap: async () => {
    if (get().status !== 'idle') return;
    set({ status: 'loading' });
    try {
      const status = await fetchAuthStatus();
      if (!status.authEnabled) {
        set({ status: 'authenticated', user: DEMO_USER });
      } else if (status.authenticated && status.user) {
        set({ status: 'authenticated', user: { name: status.user, role: 'Administrator' } });
      } else {
        set({ status: 'anonymous', user: null });
      }
    } catch {
      // Backend unreachable — don't throw away a possibly-valid token on a
      // transient outage. The next successful probe (or a 401 from a guarded
      // request) will settle the real session state.
      set({ status: getToken() ? 'authenticated' : 'anonymous', user: getToken() ? DEMO_USER : null });
    }
  },

  /** Attempt sign-in; resolves with `{ ok, message }` so the UI can react. */
  login: async (username, password) => {
    set({ status: 'loading' });
    try {
      const { user, token } = await login(username, password);
      setToken(token);
      set({ status: 'authenticated', user: { name: user, role: 'Administrator' } });
      return { ok: true };
    } catch (error) {
      set({ status: 'anonymous' });
      return { ok: false, message: error?.message ?? 'Sign-in failed' };
    }
  },

  /** Clear the session and return the app to the login gate. */
  logout: () => {
    clearToken();
    set({ status: 'anonymous', user: null });
  },
}));

// Any 401 from a guarded endpoint invalidates the session (token expired or
// revoked) and routes back to the login page via the store change.
if (typeof window !== 'undefined') {
  window.addEventListener(SESSION_EXPIRED_EVENT, () => {
    useAuthStore.getState().logout();
  });
}