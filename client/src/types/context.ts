import type { User } from "./auth";
import type { LoginFormInputs } from "./form";
import type { DerivedSharedKey, ImportedPublicKey } from "./crypto";
import type { CachedDecryptedMessage, StoredMessage } from "./chat";

export type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
  login: (data: LoginFormInputs) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  deviceIdRef: React.RefObject<string | null>;
  password: string | null;
  setPassword: React.Dispatch<React.SetStateAction<string | null>>;
}

export type ChatContextType = {
  sendMessageToUser: (message: string, receipientId: number) => Promise<void>;
  syncMessages: (targetUserId: number) => Promise<StoredMessage[]>;
  syncReadReceipt: (recipientId: number) => Promise<void>;
  sendRead: (messageIds: string[]) => void;
}

export type E2EEContextType = {
  deriveSharedKeys: (publicKeys: ImportedPublicKey[]) => Promise<DerivedSharedKey[]>;
  getAllUserPublicKeys: (userId: number) => Promise<ImportedPublicKey[]>;
  getUserDevicePublicKey: (userId: number, deviceId: string) => Promise<ImportedPublicKey[]>
  decryptCiphertext: (data: StoredMessage) => Promise<string>;
  privateKey: React.RefObject<CryptoKey | null>;
}

export type MessageCacheContextType = {
  loadMessageFromDBByUser: (conversationWith: number) => Promise<void>;
  addNewMessagesByUser: (conversationWith: number, messages: StoredMessage[]) => void;
  getMessagesByUser: (userId: number) => CachedDecryptedMessage[];
  updateReadReceipt: (msgId: string, readAt: string) => void;
  cache: Map<number, CachedDecryptedMessage[]>;
}
