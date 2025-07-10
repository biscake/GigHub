import { useCallback, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';

export const useIdempotencyKey = () => {
  const idempotencyKeyRef = useRef<string | null>(null);

  const get = useCallback(() => {
    const key = idempotencyKeyRef.current ?? uuidv4();
    
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = key;
    }

    return key;
  }, [])

  const clear = useCallback(() => {
    idempotencyKeyRef.current = null;
  }, [])

  return { get, clear };
}