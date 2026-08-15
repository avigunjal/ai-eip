import { create } from 'zustand';

let nextId = 0;

/**
 * Toast notifications with optional undo action. Pages push toasts via the
 * `useToast` hook; the Toaster renders them.
 */
export const useToastStore = create((set, get) => ({
  toasts: [],
  push: ({ message, actionLabel, action, severity = 'success', duration = 4000 }) => {
    const id = ++nextId;
    set((s) => ({
      toasts: [...s.toasts, { id, message, actionLabel, action, severity }],
    }));
    if (duration !== 0) {
      setTimeout(() => get().dismiss(id), duration);
    }
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  dismissAll: () => set({ toasts: [] }),
}));
