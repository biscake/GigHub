import type { User } from "./auth";
import type { LoginFormInputs } from "./form";
import type { DerivedSharedKey, ImportedPublicKey } from "./crypto";
import type { CachedConversationMeta, CachedDecryptedMessage, FetchResult, LatestConversationMessage, StoredMessage } from "./chat";

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
  sendMessageToConversation: (message: string, conversationKey: string) => Promise<void>;
  fetchMessagesBefore: (conversationKey: string, beforeISOString: string, COUNT?: number) => Promise<FetchResult>;
  syncReadReceipt: (conversationKey: string) => Promise<void>;
  sendRead: (conversationKey: string) => void;
}

export type E2EEContextType = {
  deriveSharedKeys: (publicKeys: ImportedPublicKey[]) => Promise<DerivedSharedKey[]>;
  getAllPublicKeysConversation: (conversationKey: string) => Promise<ImportedPublicKey[]>;
  getUserDevicePublicKey: (userId: number, deviceId: string) => Promise<ImportedPublicKey[]>;
  decryptCiphertext: (data: StoredMessage) => Promise<string | null>;
  privateKey: React.RefObject<CryptoKey | null>;
  getUserPublicKeys: (userId: number, deviceId?: string) => Promise<ImportedPublicKey[]>;
}

export type MessageCacheContextType = {
  loadMessageFromDBByKey: (conversationKey: string) => Promise<void>;
  addNewMessagesByKey: (conversationKey: string, messages: StoredMessage[]) => void;
  getMessagesByKey: (conversationKey: string) => CachedDecryptedMessage[];
  updateReadReceipt: (conversationKey: string, lastReadDate: string) => void;
  cache: Map<string, CachedDecryptedMessage[]>;
  latestConversationMessage: LatestConversationMessage[];
  getLastReadByKey: (conversationKey: string) => string;
  getConversationMetaByKey: (conversationKey: string) => CachedConversationMeta | undefined;
  isConversationMetaLoaded: (conversationKey: string) => boolean;
  cacheConversationMeta: (conversationKey: string, meta: CachedConversationMeta) => void;
}
