import type { AxiosError, AxiosRequestConfig } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import api from "../lib/api";
import type { ApiErrorResponse } from "../types/api";

export const useGetApi = <T,>(url: string, opts?: AxiosRequestConfig) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const res = await api.get(url, {...opts });
      setData(res.data);
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      if (error.name === 'AbortError') {
        return;
      }

      const errorMessage = error.response?.data?.message;

      setError(errorMessage || "Something went wrong. Please try again");
    } finally {
      setLoading(false);
    }
  }, [url, opts]);

  useEffect(() => {
    fetchData();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return { data, error, loading, refetch: fetchData };
}