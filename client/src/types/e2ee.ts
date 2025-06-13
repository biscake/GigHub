import type { SetStateAction } from "react";
import type React from "react";

export type E2EEContextType = {
  privateKey: CryptoKey | null;
  setPassword: React.Dispatch<SetStateAction<string | null>>;
  sendMessageToUser: (message: string, receipientId: number, socket: WebSocket) => Promise<void>;
  deviceId: string | null;
}
