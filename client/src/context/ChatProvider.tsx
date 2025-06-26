import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { useE2EE } from "../hooks/useE2EE";
import { useMessageCache } from "../hooks/useMessageCache";
import api from "../lib/api";
import { getAllConversationMeta, getConversationMeta, storeChatMessages, storeConversationMeta } from "../lib/indexeddb";
import { type GetAllConversationKeysResponse, type GetAllLastReadResponse, type GetChatMessagesResponse, type GetReadReceiptResponse } from "../types/api";
import type { AuthPayload, ChatMessage, ChatMessagePayload, FetchResult, NewConversationPayload, ReadPayload, StoredConversationMeta, StoredMessage, WebSocketOnMessagePayload } from "../types/chat";
import { encryptMessage } from "../utils/crypto";
import { ChatContext } from "./ChatContext";

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken, user, deviceIdRef } = useAuth();
  const { deriveSharedKeys, getAllPublicKeysConversation, getUserPublicKeys } = useE2EE();
  const socketRef = useRef<WebSocket | null>(null);
  const { addNewMessagesByKey, updateReadReceipt, loadMessageFromDBByKey } = useMessageCache();
  const loadingCache = useRef(false);

  const sendMessageNewConversation = useCallback(async (message: string, recipientId: number, gigId: number) => {
    try {
      if (!user) throw new Error("User not logged in");
      if (!socketRef.current) throw new Error("WebSocket not connected");
      
      const socket = socketRef.current;
      const allUser = [user.id, recipientId];
      const allRecipientPublicKeysNested = await Promise.all(
        allUser.map(userId => getUserPublicKeys(userId))
      );
      const allRecipientPublicKeys = allRecipientPublicKeysNested.flat();
      const sharedKeys = await deriveSharedKeys(allRecipientPublicKeys);
      const messages = await Promise.all(sharedKeys.map(async key => {
        const ciphertext = await encryptMessage(message, key.sharedKey);
        const chatMessage: ChatMessage = {
          ciphertext,
          deviceId: key.deviceId,
          recipientId: key.userId
        }

        return chatMessage;
      }));

      const payload: NewConversationPayload = {
        type: 'New-Conversation',
        to: recipientId,
        messages,
        gigId
      }

      socket.send(JSON.stringify(payload));
    } catch (err) {
      console.error("Failed to send message", err);
    }
  }, [deriveSharedKeys, getUserPublicKeys, user])

  const sendMessageToConversation = useCallback(async (message: string, conversationKey: string) => {
    try {
      if (!user) throw new Error("User not logged in");
      if (!socketRef.current) throw new Error("WebSocket not connected");
      
      const socket = socketRef.current;
      const allPublicKeys = await getAllPublicKeysConversation(conversationKey);
      const sharedKeys = await deriveSharedKeys(allPublicKeys);
      const messages = await Promise.all(sharedKeys.map(async key => {
        const ciphertext = await encryptMessage(message, key.sharedKey);
        const chatMessage: ChatMessage = {
          ciphertext,
          deviceId: key.deviceId,
          recipientId: key.userId
        }

        return chatMessage;
      }));

      const payload: ChatMessagePayload = {
        type: 'Chat',
        conversationKey,
        messages
      }

      socket.send(JSON.stringify(payload));
    } catch (err) {
      console.error("Failed to send message", err);
    }
  }, [deriveSharedKeys, user, getAllPublicKeysConversation])

  const fetchMessagesBefore = useCallback(async (conversationKey: string, beforeISOString: string, COUNT = 30): Promise<FetchResult> => {
    try {
      const deviceId = deviceIdRef.current;
      if (!user || !deviceId) throw new Error("Invalid user");
      const conversationMeta: StoredConversationMeta | undefined = await getConversationMeta(user.id, conversationKey);
      const before = conversationMeta?.oldestSyncedAt ?? null;
      const newestSynced = conversationMeta?.newestSyncedAt ?? null;

      if (before && new Date(beforeISOString).getTime() > new Date(before).getTime()) {
        return { status: 'already_synced' };
      }

      const res = await api.get<GetChatMessagesResponse>(`api/chat/conversations/${conversationKey}/messages`, {
        params: {
          count: COUNT,
          before: before
        }
      })
        
      const messages = res.data.chatMessages;
      if (messages.length === 0) return { status: 'ok', messages };

      const oldest = messages[messages.length - 1].sentAt;
      const newest = messages[0].sentAt;

      if (!oldest) throw new Error("Error getting synced date");
      await storeChatMessages(messages);

      await storeConversationMeta({
        ...conversationMeta,
        conversationKey: conversationMeta?.conversationKey ?? conversationKey,
        localUserId: user.id,
        oldestSyncedAt: oldest,
        ...((!newestSynced || newest > newestSynced) && { newestSyncedAt: newest }),
        lastFetchedAt: new Date().toISOString()
      });

      if (newestSynced && new Date(oldest).getTime() <= new Date(newestSynced).getTime()) {
        const filtered = messages.filter(msg => new Date(msg.sentAt).getTime() <= new Date(newestSynced).getTime())
        return { status: 'ok', messages: filtered };
      } else {
        return { status: 'ok', messages };
      }
    } catch (err) {
      console.error("Failed to sync conversation", err);
      return { status: 'failed' };
    }
  }, [deviceIdRef, user]);

  const fetchNewMessages = useCallback(async (conversationKey: string): Promise<FetchResult> => {
    try {
      const COUNT = 30;
      const deviceId = deviceIdRef.current;
      if (!user || !deviceId) throw new Error("Invalid user");
      const conversationMeta: StoredConversationMeta | undefined = await getConversationMeta(user.id, conversationKey);
      const after = conversationMeta?.newestSyncedAt ?? null;

      let result: StoredMessage[] = [];
  
      while (true) {
        const res = await api.get<GetChatMessagesResponse>(`api/chat/conversations/${conversationKey}/messages`, {
          params: {
            count: COUNT,
            since: after
          }
        })
        
        const messages = res.data.chatMessages;
        if (messages.length === 0) break;

        result = [...messages, ...result];

        const newest = messages[0].sentAt;
  
        if (!newest) throw new Error("Error getting synced date");
        await storeChatMessages(messages);
  
        await storeConversationMeta({
          ...conversationMeta,
          conversationKey: conversationMeta?.conversationKey ?? conversationKey,
          localUserId: user.id,
          newestSyncedAt: newest,
          lastFetchedAt: new Date().toISOString()
        });

        if (messages.length < COUNT) {
          break;
        }
      }

      return { status: 'ok', messages: result };
    } catch (err) {
      console.error("Failed to fetch new messages", err);
      return { status: 'failed' };
    }
  }, [deviceIdRef, user]);

  const syncReadReceipt = useCallback(async (conversationKey: string) => {
    try {
      if (!user) throw new Error("Invalid user");
      const res = await api.get<GetReadReceiptResponse>(`api/chat/conversations/${conversationKey}/read-receipt`);

      const { lastReads } = res.data;
      const filtered = lastReads.filter(l => l.userId !== user.id);
      filtered.forEach(l => {
        updateReadReceipt(conversationKey, l.lastRead);
      })
    } catch (err) {
      console.error("Failed to sync read receipt", err);
    }
  }, [updateReadReceipt, user])

  const sendRead = useCallback((conversationKey: string) => {
    try {
      if (!user) throw new Error("User not logged in");
      if (!socketRef.current) throw new Error("WebSocket not connected");

      const socket = socketRef.current;

      const payload: ReadPayload = {
        type: 'Read',
        conversationKey,
        lastRead: new Date().toISOString()
      }

      socket.send(JSON.stringify(payload));
    } catch (err) {
      console.error("Failed to send message", err);
    }
  }, [user])

  // connects client to websocket
  useEffect(() => {
    if (!accessToken || !user) return;

    socketRef.current = new WebSocket(`ws://localhost:3000/ws`);

    socketRef.current.onopen = () => {
      console.log("WebSocket connected");

      socketRef.current?.send(JSON.stringify({
        type: 'Auth',
        accessToken,
      } as AuthPayload));
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socketRef.current.onmessage = async (event) => {
      const data: WebSocketOnMessagePayload = JSON.parse(event.data);
      if (data.type === 'Chat') {
        const result = await fetchNewMessages(data.conversationKey);

        if (result.status === 'ok') {
          addNewMessagesByKey(result.messages[0].conversationKey, result.messages);
        }
      }

      if (data.type === 'Read-Receipt') {
        updateReadReceipt(data.conversationKey, data.lastRead);
      }
    }

    return () => {
      socketRef.current?.close();
    };
  }, [accessToken, deviceIdRef, user, addNewMessagesByKey, fetchNewMessages, updateReadReceipt])

  // fetches all conversations on load and load messages onto cache
  useEffect(() => {
    if (!user || loadingCache.current) return;
    loadingCache.current = true;

    const fetchNewMessages = async () => {
      try {
        const res = await api.get<GetAllConversationKeysResponse>(`api/chat/conversations`);
        
        const conversationKeys = res.data.conversationKeys;
        const dateNow = new Date().toISOString();
        
        conversationKeys?.forEach(async (key) => {
          await fetchMessagesBefore(key, dateNow);
        })
      } catch (err) {
        console.error("Failed to fetch new messages", err);
      }
    }

    const loadMessagesToCache = async () => {
      try {
        const allConversationMetas = await getAllConversationMeta();
        allConversationMetas?.forEach(async meta => {
          await loadMessageFromDBByKey(meta.conversationKey);
        });
      } catch (err) {
        console.error("Error loading messages into cache", err);
      } 
    }

    const fetchAndLoadLastReads = async () => {
      try {
        const res = await api.get<GetAllLastReadResponse>(`api/chat/conversations/read-receipt`);

        const lastReads = res.data.lastReads;

        lastReads.forEach(l => {
          updateReadReceipt(l.conversationKey, l.lastRead);
        })
      } catch (err) {
        console.error("Error loading last reads", err)
      } finally {
        loadingCache.current = false;
      }
    }

    fetchNewMessages();
    loadMessagesToCache();
    fetchAndLoadLastReads();
  }, [user, loadMessageFromDBByKey, fetchMessagesBefore, updateReadReceipt])

  return (
    <ChatContext.Provider value={{ sendMessageToConversation, fetchMessagesBefore, syncReadReceipt, sendRead, sendMessageNewConversation }}>
      {children}
    </ChatContext.Provider>
  )
}
