import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE } from '../config';

type UseFetchOptions<T> = {
  /** Provide a default value to avoid undefined checks in consumers */
  initialData?: T;
  /** Optional fetch init overrides */
  init?: RequestInit;
  /** Optional manual enable switch */
  enabled?: boolean;
  /** Allow transforming the payload before storing it */
  transform?: (payload: unknown) => T;
};

export const useFetch = <T = unknown>(
  endpoint: string,
  options: UseFetchOptions<T> = {}
) => {
  const { initialData, init, enabled = true, transform } = options;
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(Boolean(enabled));
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        signal: controller.signal,
        ...init,
      });

      if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`);
      }

      const payload = await response.json();
      const nextData = transform ? transform(payload) : payload;
      setData(nextData as T);
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return;
      }
      setError((err as Error).message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [enabled, endpoint, init, transform]);

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

