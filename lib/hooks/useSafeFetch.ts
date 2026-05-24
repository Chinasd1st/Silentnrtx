import { useCallback, useEffect, useRef, useState } from "react";
import { mapApiError } from "@/lib/api";
import { getCache, setCache } from "@/lib/cache";

interface UseSafeFetchOptions<T, TError = string> {
  fetchFn: (signal: AbortSignal) => Promise<T>;
  cacheKey?: string;
  cacheTTL?: number;
  immediate?: boolean;
  errorMap?: (err: unknown) => TError;
}

interface UseSafeFetchResult<T, TError = string> {
  data: T | null;
  loading: boolean;
  error: TError | null;
  execute: () => void;
  reset: () => void;
  setData: (data: T) => void;
}

export function useSafeFetch<T, TError = string>({
  fetchFn,
  cacheKey,
  cacheTTL,
  immediate = true,
  errorMap,
}: UseSafeFetchOptions<T, TError>): UseSafeFetchResult<T, TError> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<TError | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;
  const cacheKeyRef = useRef(cacheKey);
  cacheKeyRef.current = cacheKey;
  const cacheTTLRef = useRef(cacheTTL);
  cacheTTLRef.current = cacheTTL;
  const errorMapRef = useRef(errorMap);
  errorMapRef.current = errorMap;

  const execute = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    if (cacheKeyRef.current && cacheTTLRef.current) {
      const cached = getCache<unknown>(cacheKeyRef.current, cacheTTLRef.current);
      if (cached) {
        setData(cached as T);
        setLoading(false);
        return;
      }
    }

    fetchFnRef
      .current(controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setData(result);
        if (cacheKeyRef.current) setCache(cacheKeyRef.current, result);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const mapped = errorMapRef.current
          ? errorMapRef.current(err)
          : (mapApiError(err).message as TError);
        setError(mapped);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (immediate) execute();
    const onClear = () => execute();
    window.addEventListener("cache-cleared", onClear);
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
      window.removeEventListener("cache-cleared", onClear);
    };
  }, [execute, immediate]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset, setData };
}
