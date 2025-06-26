import { useCallback, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

export const useIdempotencyKey = () => {
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);

  const get = useCallback(() => {
    const key = idempotencyKey ?? uuidv4();
    
    if (!idempotencyKey) {
      setIdempotencyKey(key);
    }

    return key;
  }, [idempotencyKey]);

  const clear = useCallback(() => {
    setIdempotencyKey(null);
  }, []);

  return { get, clear };
}