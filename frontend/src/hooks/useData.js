import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Generic data-loading hook. Wraps an async fetcher and exposes
 * `data` / `loading` / `error` / `retry` for consistent loading,
 * empty, and error states across pages.
 */
export function useData(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetcherRef.current();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, retry: load, reload: load };
}
