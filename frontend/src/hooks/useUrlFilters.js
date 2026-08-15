import { useSearchParams } from 'react-router';

/**
 * URL-query-driven filter state. Keeps filters, sort, search, page, and date
 * range in the URL (shareable + back-button friendly) per the spec.
 */
export function useUrlFilters(keys) {
  const [searchParams, setSearchParams] = useSearchParams();

  const values = {};
  keys.forEach((k) => {
    values[k] = searchParams.get(k) ?? '';
  });

  const set = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === '' || value == null) next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  };

  const setMany = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === '' || v == null) next.delete(k);
      else next.set(k, v);
    });
    setSearchParams(next, { replace: true });
  };

  const clear = () => setSearchParams({}, { replace: true });

  return { values, set, setMany, clear, searchParams };
}
