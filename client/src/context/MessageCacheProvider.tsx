import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import type { CachedDecryptedMessage, StoredMessage } from "../types/chat";
import { getMessagesByPage } from "../lib/indexeddb";
import { useE2EE } from "../hooks/useE2EE";
import { MessageCacheContext } from "./MessageCacheContext";
import { useAuth } from "../hooks/useAuth";
import type { User } from "../types/auth";

export const MessageCacheProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { decryptCiphertext } = useE2EE();
  const [cache, setCache] = useState(new Map<number, CachedDecryptedMessage[]>()); // key: userId, value: messages with userId sorted by sentAt in descending order
  const conversationPage = useRef(new Map<number, number>()); // pagination for current page cached for conversation with another user, key: userId, value: pageNumber
  const msgIdMap = useRef(new Map<string, CachedDecryptedMessage>()); // to find msg to update read receipt in cache
  const prevUser = useRef<User | null>(null);

  useEffect(() => {
    if (!user) return;

    // if log into another account, wipe cache
    if (user.id !== prevUser.current?.id) {
      setCache(new Map<number, CachedDecryptedMessage[]>());
      conversationPage.current = new Map<number, number>();
      msgIdMap.current = new Map<string, CachedDecryptedMessage>();
      prevUser.current = user;
    }
  }, [user]);

  const decryptAndUpdateMap = useCallback(async (encryptedMessages: StoredMessage[]) => {
    return await Promise.all(encryptedMessages.map(async encrypted => {
      const text = await decryptCiphertext(encrypted);
      const toCache: CachedDecryptedMessage = {
        text: text,
        sentAt: encrypted.sentAt,
        readAt: encrypted.readAt,
        direction: encrypted.direction,
        id: encrypted.id
      }

      msgIdMap.current.set(encrypted.id, toCache);
      return toCache;
    }));
  }, [decryptCiphertext]);

  const loadMessageFromDBByUser = useCallback(async (conversationWith: number) => {
    if (!user) return;
    const conversationPageMap = conversationPage.current;
    
    const page = conversationPageMap.get(conversationWith) ?? 0; // init first load to page 0, 0-indexed
    const encryptedMessages: StoredMessage[] = await getMessagesByPage(user.id, conversationWith, page, 30);
    const decryptedMessages = await decryptAndUpdateMap(encryptedMessages);

    conversationPageMap.set(conversationWith, page + 1);
    setCache(prev => {
      const tmp = new Map(prev);
      const prevMessages = tmp.get(conversationWith) ?? [];
      const newMessages = [...prevMessages, ...decryptedMessages];
      tmp.set(conversationWith, newMessages);
      return tmp;
    })
  }, [user, decryptAndUpdateMap]);

  const addNewMessagesByUser = useCallback(async (conversationWith: number, messages: StoredMessage[]) => {
    if (!user) return;

    const decryptedMessages = await decryptAndUpdateMap(messages);

    setCache(prev => {
      const tmp = new Map(prev);
      const prevMessages = tmp.get(conversationWith) ?? [];
      const newMessages = [...decryptedMessages, ...prevMessages]; // prepend new message to front of array, since array is sorted in descending order
      tmp.set(conversationWith, newMessages);
      return tmp;
    })
  }, [user, decryptAndUpdateMap]);

  const getMessagesByUser = useCallback((userId: number): CachedDecryptedMessage[] => {
    if (!user) return [];
    return cache.get(userId) ?? [];
  }, [cache, user]);

  const updateReadReceipt = useCallback((msgId: string, readAt: string) => {
    if (!user) return;
    if (!msgIdMap.current.has(msgId)) throw new Error("Message not found to update read receipt");
    const msg = msgIdMap.current.get(msgId);

    msg!.readAt = readAt;
    setCache(prev => new Map(prev)); // force a re-render
  }, [user])

  return (
    <MessageCacheContext.Provider value={{ loadMessageFromDBByUser, getMessagesByUser, updateReadReceipt, addNewMessagesByUser, cache }}>
      {children}
    </MessageCacheContext.Provider>
  )
}