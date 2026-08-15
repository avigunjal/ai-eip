import { useCallback } from 'react';
import { useToastStore } from '../store/toastStore.js';

/** Returns a `toast(message, options)` helper for undoable actions. */
export function useToast() {
  const push = useToastStore((s) => s.push);
  return useCallback(
    (message, options = {}) => push({ message, ...options }),
    [push],
  );
}
