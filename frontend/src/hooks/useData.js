import { useCallback, useEffect, useRef, useState } from 'react';
import { withRetry } from '../api/client.js';

/**
 * Generic data-loading hook. Wraps an async fetcher with automatic retries
 * (bounded exponential backoff: 1s, 2s across 3 attempts) and exposes
 * `data` / `loading` / `error` / `retry` / `retryCount` for consistent
 * loading, empty, and error states across pages.
 */
export function useData(fetcher, deps = []) {
  const [state, setState] = useState({ data: undefined, loading: true, error: null, retryCount: 0 });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null, retryCount: 0 }));
    try {
      const data = await withRetry(() => fetcherRef.current(), {
        retries: 2,
        baseDelayMs: 1_000,
      });
      setState({ data, loading: false, error: null, retryCount: 0 });
    } catch (error) {
      setState({ data: null, loading: false, error, retryCount: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, retry: load, reload: load };
}