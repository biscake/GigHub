import type { SetStateAction } from "react";

export type E2EEContextType = {
  initKeys: () => Promise<void>;
  setEncryptionPassword: React.Dispatch<SetStateAction<string | null>>;
  privateKey: JsonWebKey | null;
  deleteKey: () => Promise<void>;
}
