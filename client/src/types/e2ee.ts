import type { SetStateAction } from "react";
import type React from "react";

export type E2EEContextType = {
  privateKey: CryptoKey | null;
  setPassword: React.Dispatch<SetStateAction<string | null>>;
  deviceId: string | null;
}
