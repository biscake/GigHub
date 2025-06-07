import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';

export const useIdempotencyKey = () => {
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);

  const get = () => {
    const key = idempotencyKey ?? uuidv4();

    if (!idempotencyKey) {
      setIdempotencyKey(key);
    }

    return key;
  }

  const clear = () => {
    setIdempotencyKey(null);
  }

  return { get, clear };
}