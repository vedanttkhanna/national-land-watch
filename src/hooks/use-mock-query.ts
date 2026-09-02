import { useCallback, useEffect, useState } from "react";

export interface QueryResult<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | undefined;
  refetch: () => void;
}

/**
 * Thin wrapper over the mock API layer in `@/lib/nlams-data`.
 * Swap the resolver for a real `fetch` and every screen keeps its loading,
 * empty and error states without further changes.
 */
export function useMockQuery<T>(resolver: () => Promise<T>, deps: unknown[] = []): QueryResult<T> {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [nonce, setNonce] = useState(0);

  // The resolver is recreated every render by callers; deps drive refetching.
  const run = useCallback(resolver, deps);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    run()
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause : new Error("Unable to load data"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [run, nonce]);

  return { data, loading, error, refetch: () => setNonce((value) => value + 1) };
}
