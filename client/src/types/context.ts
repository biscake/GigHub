import type { SetStateAction } from "react";
import type { User } from "./auth";
import type { LoginFormInputs } from "./form";
import type { DerivedSharedKey, ImportedPublicKey } from "./key";
import type { StoredMessage } from "./chat";

export type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
  login: (data: LoginFormInputs) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export type ChatContextType = {
  sendMessageToUser: (message: string, receipientId: number) => Promise<void>;
  syncMessages: (targetUserId: number) => Promise<void>;
  decryptChatMessage: (data: StoredMessage) => Promise<string>;
}

export type E2EEContextType = {
  privateKey: CryptoKey | null;
  setPassword: React.Dispatch<SetStateAction<string | null>>;
  deviceId: string | null;
  deriveSharedKeys: (publicKeys: ImportedPublicKey[]) => Promise<DerivedSharedKey[]>;
  getAllUserPublicKeys: (userId: number) => Promise<ImportedPublicKey[]>;
  getUserDevicePublicKey: (userId: number, deviceId: string) => Promise<ImportedPublicKey[]>
}
