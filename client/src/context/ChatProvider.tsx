import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../lib/api";
import { type GetChatMessagesResponse, type GetReadReceiptResponse } from "../types/api";
import { encryptMessage } from "../utils/crypto";
import { useE2EE } from "../hooks/useE2EE";
import { ChatContext } from "./ChatContext";
import type { AuthPayload, ChatMessage, ChatMessagePayload, WebSocketOnMessagePayload, StoredConversationMeta, ReadPayload, StoredMessage } from "../types/chat";
import { getConversationMeta, storeChatMessages, storeConversationMeta, updateMessageReadAt } from "../lib/indexeddb";
import { useMessageCache } from "../hooks/useMessageCache";

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken, user, deviceIdRef } = useAuth();
  const { deriveSharedKeys, getAllUserPublicKeys } = useE2EE();
  const socketRef = useRef<WebSocket | null>(null);
  const { addNewMessagesByUser, updateReadReceipt } = useMessageCache();

  const sendMessageToUser = useCallback(async (message: string, receipientId: number) => {
    try {
      if (!user) throw new Error("User not logged in");
      if (!socketRef.current) throw new Error("WebSocket not connected");
      
      const socket = socketRef.current;
      const receipientPublicKeys = await getAllUserPublicKeys(receipientId);
      const senderPublicKeys = await getAllUserPublicKeys(user.id);
      const sharedKeys = await deriveSharedKeys([...receipientPublicKeys, ...senderPublicKeys]);
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
        to: receipientId,
        messages
      }

      socket.send(JSON.stringify(payload));
    } catch (err) {
      console.error("Failed to send message", err);
    }
  }, [deriveSharedKeys, user, getAllUserPublicKeys])

  const syncMessages = useCallback(async (otherUserId: number, fetchNew?: boolean): Promise<StoredMessage[]> => {
    try {
      const deviceId = deviceIdRef.current;
      if (!user || !deviceId) throw new Error("Invalid user");
      const conversationMeta: StoredConversationMeta | undefined = await getConversationMeta(user.id, otherUserId);
      let before = conversationMeta?.oldestSyncedAt ?? null;
      let after = conversationMeta?.newestSyncedAt ?? null;

      let result: StoredMessage[] = [];
  
      while (true) {
        let params: { count: number, afterDateISOString?: string | null, beforeDateISOString?: string | null };
  
        if (fetchNew) {
          params = {
            count: 30,
            afterDateISOString: after
          }
        } else {
          params = {
            count: 30,
            beforeDateISOString: before
          }
        }
  
        const res = await api.get<GetChatMessagesResponse>(`api/chat/conversations/${otherUserId}/messages`, { params })
        
        const messages = res.data.chatMessages;
        if (messages.length === 0) break;

        result = [...messages, ...result];

        before = messages[messages.length - 1].sentAt;
        after = messages[messages.length - 1].sentAt;
  
        if (!before || !after) throw new Error("Error getting synced date");
        await storeChatMessages(messages);
  
        await storeConversationMeta({
          ...conversationMeta,
          conversationKey: conversationMeta?.conversationKey ?? `${user.id}-${otherUserId}`,
          localUserId: user.id,
          ...(fetchNew ? { newestSyncedAt: after } : { oldestSyncedAt: before }),
          lastFetchedAt: new Date().toISOString()
        });
        
        if (!fetchNew && conversationMeta?.oldestSyncedAt && new Date(before) <= new Date(conversationMeta.oldestSyncedAt)) {
          break;
        }
      }
  
      if (!fetchNew) {
        return [...(await syncMessages(otherUserId, true)), ...result];
      }

      return result;
    } catch (err) {
      console.error("Failed to sync conversation", err);
      return [];
    }
  }, [deviceIdRef, user]);

  const syncReadReceipt = useCallback(async (recipientId: number) => {
    try {
      if (!user) throw new Error("Invalid user");
      const conversationMeta: StoredConversationMeta | undefined = await getConversationMeta(user.id, recipientId);
      const lastUpdated = conversationMeta?.lastReadReceiptUpdatedAt ?? null;

      const res = await api.get<GetReadReceiptResponse>(`api/chat/conversations/${recipientId}/read-receipt`, {
        params: {
          since: lastUpdated
        }
      });

      const { updatedReadReceipts, lastUpdatedISOString } = res.data;

      await Promise.all(
        updatedReadReceipts.map(async msg => {
          await updateMessageReadAt(msg.messageId, msg.readAt);
        })
      )

      await storeConversationMeta({
        ...conversationMeta,
        conversationKey: conversationMeta?.conversationKey ?? `${user.id}-${recipientId}`,
        localUserId: user.id,
        lastReadReceiptUpdatedAt: lastUpdatedISOString
      });
    } catch (err) {
      console.error("Failed to sync read receipt", err);
    }
  }, [user])

  const sendRead = useCallback((messageIds: string[]) => {
    try {
      if (!user) throw new Error("User not logged in");
      if (!socketRef.current) throw new Error("WebSocket not connected");

      const socket = socketRef.current;

      const payload: ReadPayload = {
        type: 'Read',
        messageIds
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
        const isSender = 'to' in data;

        if (isSender) {
          const messages = await syncMessages(data.to);
          addNewMessagesByUser(data.to, messages);
        } else {
          const messages = await syncMessages(data.from);
          addNewMessagesByUser(data.from, messages);
        }
      }

      if (data.type === 'Read-Receipt') {
        await updateMessageReadAt(data.messageId, data.readAt);
        updateReadReceipt(data.messageId, data.readAt);
      }
    }

    return () => {
      socketRef.current?.close();
    };
  }, [accessToken, deviceIdRef, user, syncMessages, addNewMessagesByUser, updateReadReceipt])

  return (
    <ChatContext.Provider value={{ sendMessageToUser, syncMessages, syncReadReceipt, sendRead }}>
      {children}
    </ChatContext.Provider>
  )
}
