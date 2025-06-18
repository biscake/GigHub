import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../lib/api";
import { type GetChatMessages, type GetPublicKeysResponse } from "../types/api";
import type { ImportedPublicKey, PublicKey } from "../types/key";
import { decryptMessage, deriveEDCHSharedKey, encryptMessage, importEDCHJwk } from "../utils/crypto";
import { useE2EE } from "../hooks/useE2EE";
import { ChatContext } from "./ChatContext";
import type { AuthPayload, ChatMessage, ChatMessagePayload, ChatOnMessagePayload, StoredConversationMeta } from "../types/chat";
import { getConversationMeta, storeChatMessages, storeConversationMeta } from "../lib/indexeddb";

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { privateKey, deviceId } = useE2EE();
  const { accessToken } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);

  // connects client to websocket
  useEffect(() => {
    if (!accessToken || !deviceId) return;

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
      const data = JSON.parse(event.data);
      await decryptReceivedChatMessage(data);
    };

    return () => {
      socketRef.current?.close();
    };
  }, [accessToken, deviceId])

  const getPublicKeysByUserId = async (userId: number, deviceId?: string): Promise<ImportedPublicKey[]> => {
    try {
      const res = await api.get<GetPublicKeysResponse>(`/api/keys/public/${userId}`, {
        params: {
          ...(deviceId && { deviceId })
        } 
      });

      const publicKeys: PublicKey[] = res.data.publicKeys;
      
      const importedKey = await Promise.all(
        publicKeys.map(async key => {
          const importedKey: ImportedPublicKey = {
            deviceId: key.deviceId,
            publicKey: await importEDCHJwk(key.publicKey),
            userId
          }
          return importedKey;
        })
      );

      return importedKey;
    } catch (err) {
      console.error("Failed to get public keys", err);
      return [];
    }
  }

  const deriveSharedKeys = useCallback(async (publicKeys: ImportedPublicKey[]) => {
    try {
      if (!privateKey) throw new Error("Private key not initialized");

      const sharedKeys = await Promise.all(
        publicKeys.map(async entry => ({ deviceId: entry.deviceId, sharedKey: await deriveEDCHSharedKey(privateKey, entry.publicKey), userId: entry.userId }))
      );

      return sharedKeys;
    } catch (err) {
      console.error("Failed to derive shared keys", err);
      throw err;
    }
  }, [privateKey])

  const sendMessageToUser = async (message: string, receipientId: number) => {
    try {
      if (!user) throw new Error("User not logged in");
      if (!socketRef.current) throw new Error("WebSocket not connected");

      const socket = socketRef.current
      const receipientPublicKeys = await getPublicKeysByUserId(receipientId);
      const senderPublicKeys = await getPublicKeysByUserId(user.id);
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

  const decryptReceivedChatMessage = useCallback(async (data: ChatOnMessagePayload) => {
    try {
      const publicKeys = await getPublicKeysByUserId(data.from.userId, data.from.deviceId);
      const sharedKeys = await deriveSharedKeys(publicKeys);

      const { ciphertext, ...rest } = data;
      const decrypted = {
        ...rest,
        message: await decryptMessage(ciphertext, sharedKeys[0].sharedKey)
      }

      console.log(decrypted);
      return decrypted;
    } catch (err) {
      console.error("Failed to decrypt message", err);
    }
  }, [deriveSharedKeys])

  const syncOldMessages = useCallback(async (targetUserId: number) => {
    if (!user) throw new Error("Invalid user");
    const conversationMeta: StoredConversationMeta | undefined = await getConversationMeta(user.id, targetUserId);
    let before = conversationMeta?.oldestSyncedAt ?? null;
    console.log("syncing old messages");

    while (true) {
      const res = await api.get<GetChatMessages>(`api/chat/conversations/${user.id}/${targetUserId}`, {
        params: {
          originDeviceId: deviceId,
          count: 30,
          beforeDateISOString: before
        }
      })

      const messages = res.data.chatMessages;
      console.log(messages);
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
          afterDateISOString: after
        }
      })

      const messages = res.data.chatMessages;
      console.log(messages);
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
      
      if (conversationMeta?.oldestSyncedAt && new Date(after) <= new Date(conversationMeta.oldestSyncedAt)) {
        break;
      }
    }
  }, [deviceId, user])

  return (
    <ChatContext.Provider value={{ sendMessageToUser, syncNewMessages, syncOldMessages }}>
      {children}
    </ChatContext.Provider>
  )
}
