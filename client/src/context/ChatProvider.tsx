import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../lib/api";
import { type GetChatMessages } from "../types/api";
import { decryptMessage, encryptMessage } from "../utils/crypto";
import { useE2EE } from "../hooks/useE2EE";
import { ChatContext } from "./ChatContext";
import type { AuthPayload, ChatMessage, ChatMessagePayload, ChatOnMessagePayload, StoredConversationMeta, StoredMessage } from "../types/chat";
import { getConversationMeta, storeChatMessages, storeConversationMeta } from "../lib/indexeddb";

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { deviceId, deriveSharedKeys, getAllUserPublicKeys, getUserDevicePublicKey } = useE2EE();
  const { accessToken } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);

  const sendMessageToUser = async (message: string, receipientId: number) => {
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
  }

  const decryptChatMessage = useCallback(async (data: StoredMessage) => {
    try {
      const publicKeys = await getUserDevicePublicKey(data.from.userId, data.from.deviceId);
      const sharedKeys = await deriveSharedKeys(publicKeys);

      const { ciphertext } = data;

      const decrypted = await decryptMessage(ciphertext, sharedKeys[0].sharedKey);
      return decrypted;
    } catch (err) {
      console.error("Failed to decrypt message", err);
      return "Error decrypting this message";
    }
  }, [deriveSharedKeys, getUserDevicePublicKey])

  const syncOldMessages = useCallback(async (targetUserId: number) => {
    if (!user) throw new Error("Invalid user");
    const conversationMeta: StoredConversationMeta | undefined = await getConversationMeta(user.id, targetUserId);
    let before = conversationMeta?.oldestSyncedAt ?? null;

    while (true) {
      const res = await api.get<GetChatMessages>(`api/chat/conversations/${user.id}/${targetUserId}`, {
        params: {
          originDeviceId: deviceId,
          count: 30,
          beforeDateISOString: before
        }
      })

      const messages = res.data.chatMessages;
      if (messages.length === 0) break;

      before = messages[messages.length - 1].sentAt;

      if (!before) throw new Error("Error getting synced date");
      await storeChatMessages(messages);

      await storeConversationMeta({
        ...conversationMeta,
        conversationKey: `${user.id}-${targetUserId}`,
        localUserId: user.id,
        oldestSyncedAt: before,
        lastFetchedAt: new Date().toISOString()
      });
      
      if (conversationMeta?.oldestSyncedAt && new Date(before) <= new Date(conversationMeta.oldestSyncedAt)) {
        break;
      }
    }
  }, [deviceId, user])

  const syncNewMessages = useCallback(async (targetUserId: number) => {
    if (!user) throw new Error("Invalid user");
    const conversationMeta: StoredConversationMeta | undefined = await getConversationMeta(user.id, targetUserId);
    let after = conversationMeta?.newestSyncedAt ?? null;

    while (true) {
      const res = await api.get<GetChatMessages>(`api/chat/conversations/${user.id}/${targetUserId}`, {
        params: {
          originDeviceId: deviceId,
          count: 30,
          afterDateISOString: after
        }
      })

      const messages = res.data.chatMessages;
      if (messages.length === 0) break;

      after = messages[messages.length - 1].sentAt;

      if (!after) throw new Error("Error getting synced date");
      await storeChatMessages(messages);

      await storeConversationMeta({
        ...conversationMeta,
        conversationKey: `${user.id}-${targetUserId}`,
        localUserId: user.id,
        newestSyncedAt: after,
        lastFetchedAt: new Date().toISOString()
      });
    }
  }, [deviceId, user])

  const syncMessages = useCallback(async (targetUserId: number) => {
    await syncOldMessages(targetUserId);
    await syncNewMessages(targetUserId);
  }, [syncOldMessages, syncNewMessages])

  // connects client to websocket
  useEffect(() => {
    if (!accessToken || !deviceId || !user) return;

    socketRef.current = new WebSocket(`ws://localhost:3000/ws`);

    socketRef.current.onopen = () => {
      console.log("WebSocket connected");

      socketRef.current?.send(JSON.stringify({
        type: 'Auth',
        accessToken,
        deviceId
      } as AuthPayload));
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socketRef.current.onmessage = async (event) => {
      const data: ChatOnMessagePayload = JSON.parse(event.data);
      
      if (data.type === 'Chat') {
        const isSender = 'to' in data;
    
        if (isSender) {
          await syncMessages(data.to);
        } else {
          await syncMessages(data.from)
        }
      }
    }

    return () => {
      socketRef.current?.close();
    };
  }, [accessToken, deviceId, user, syncMessages])

  return (
    <ChatContext.Provider value={{ sendMessageToUser, syncMessages, decryptChatMessage }}>
      {children}
    </ChatContext.Provider>
  )
}
