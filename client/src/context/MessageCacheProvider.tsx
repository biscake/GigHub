import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import type { CachedDecryptedMessage, LatestConversationMessage, StoredMessage } from "../types/chat";
import { getMessagesByPage } from "../lib/indexeddb";
import { useE2EE } from "../hooks/useE2EE";
import { MessageCacheContext } from "./MessageCacheContext";
import { useAuth } from "../hooks/useAuth";
import type { User } from "../types/auth";

export const MessageCacheProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { decryptCiphertext } = useE2EE();
  const [cache, setCache] = useState(new Map<string, CachedDecryptedMessage[]>()); // key: conversationKey, value: messages with userId sorted by sentAt in descending order
  const conversationOffSet = useRef(new Map<string, number>()); // offset for new messages pagination
  const msgIdMap = useRef(new Map<string, CachedDecryptedMessage>()); // to find msg to update read receipt in cache
  const prevUser = useRef<User | null>(null);
  const [latestConversationMessage, setLatestConversationMessage] = useState<LatestConversationMessage[]>([]);
  const [lastRead, setLastRead] = useState(new Map<string, string>());

  useEffect(() => {
    if (!user) return;

    // if log into another account, wipe cache
    if (user.id !== prevUser.current?.id) {
      setCache(new Map<string, CachedDecryptedMessage[]>());
      conversationOffSet.current = new Map<string, number>();
      msgIdMap.current = new Map<string, CachedDecryptedMessage>();
      prevUser.current = user;
      setLastRead(new Map<string, string>());
    }
  }, [user]);

  const updateLatestConversation = useCallback((cacheMap: Map<string, CachedDecryptedMessage[]>) => {
    const result: LatestConversationMessage[] = [];
    cacheMap.forEach((messages, conversationKey) => {
      result.push({
        latestMessage: messages[0],
        conversationKey
      })
    })

    setLatestConversationMessage(result.sort((a, b) => new Date(a.latestMessage.sentAt).getTime() - new Date(b.latestMessage.sentAt).getTime()));
  }, []);

  const decryptAndUpdateMap = useCallback(async (encryptedMessages: StoredMessage[]) => {
    return await Promise.all(encryptedMessages.map(async encrypted => {
      const text = await decryptCiphertext(encrypted);
      const toCache: CachedDecryptedMessage = {
        text: text,
        sentAt: encrypted.sentAt,
        direction: encrypted.direction,
        id: encrypted.id
      }

      msgIdMap.current.set(encrypted.id, toCache);
      return toCache;
    }));
  }, [decryptCiphertext]);

  const loadMessageFromDBByKey = useCallback(async (conversationKey: string) => {
    if (!user) return;
    const conversationOffsetMap = conversationOffSet.current;
    
    const offset = conversationOffsetMap.get(conversationKey) ?? 0; // init first offset to 0
    const encryptedMessages: StoredMessage[] = await getMessagesByPage(user.id, conversationKey, offset, 30);
    const decryptedMessages = await decryptAndUpdateMap(encryptedMessages);
    conversationOffsetMap.set(conversationKey, offset + encryptedMessages.length);

    setCache(prev => {
      const tmp = new Map(prev);
      const prevMessages = tmp.get(conversationKey) ?? [];
      const newMessages = [...prevMessages, ...decryptedMessages];
      tmp.set(conversationKey, newMessages);
      updateLatestConversation(tmp);
      return tmp;
    })
  }, [user, decryptAndUpdateMap, updateLatestConversation]);

  const addNewMessagesByKey = useCallback(async (conversationKey: string, messages: StoredMessage[]) => {
    const decryptedMessages = await decryptAndUpdateMap(messages);
    const conversationOffsetMap = conversationOffSet.current;
    const offset = conversationOffsetMap.get(conversationKey) ?? 0;
    conversationOffsetMap.set(conversationKey, offset + 1);

    setCache(prev => {
      const tmp = new Map(prev);
      const prevMessages = tmp.get(conversationKey) ?? [];
      const newMessages = [...decryptedMessages, ...prevMessages]; // prepend new message to front of array, since array is sorted in descending order
      tmp.set(conversationKey, newMessages);
      updateLatestConversation(tmp);
      return tmp;
    })
  }, [decryptAndUpdateMap, updateLatestConversation]);

  const getMessagesByKey = useCallback((conversationKey: string): CachedDecryptedMessage[] => {
    return cache.get(conversationKey) ?? [];
  }, [cache]);

  const updateReadReceipt = useCallback((conversationKey: string, lastReadDate: string) => {
    setLastRead(prev => {
      const tmp = new Map(prev);
      tmp.set(conversationKey, lastReadDate);
      return tmp;
    })
  }, []);

  const getLastReadByKey = useCallback((conversationKey: string) => {
    return lastRead.get(conversationKey) ?? "";
  }, [lastRead])

  return (
    <MessageCacheContext.Provider value={{
      loadMessageFromDBByKey,
      getMessagesByKey,
      updateReadReceipt,
      addNewMessagesByKey,
      cache,
      latestConversationMessage,
      getLastReadByKey
    }}>
      {children}
    </MessageCacheContext.Provider>
  )
}