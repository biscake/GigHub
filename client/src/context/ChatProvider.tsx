import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../lib/api";
import type { GetPublicKeysResponse } from "../types/api";
import type { ImportedPublicKey, PublicKey } from "../types/key";
import { decryptMessage, deriveEDCHSharedKey, encryptMessage, importEDCHJwk } from "../utils/crypto";
import { useE2EE } from "../hooks/useE2EE";
import { ChatContext } from "./ChatContext";
import type { AuthPayload, ChatMessagePayload, ChatReceipientPayload } from "../types/chat";

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
      console.log(data)
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
          deviceId: deviceId
        } 
      });

      const publicKeys: PublicKey[] = res.data.publicKeys;
      
      const importedKey = await Promise.all(
        publicKeys.map(async key => {
          const importedKey: ImportedPublicKey = {
            ...key,
            publicKey: await importEDCHJwk(key.publicKey)

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
        publicKeys.map(async entry => ({ deviceId: entry.deviceId, sharedKey: await deriveEDCHSharedKey(privateKey, entry.publicKey) }))
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
      const publicKeys = await getPublicKeysByUserId(receipientId);
      const sharedKeys = await deriveSharedKeys(publicKeys);

      sharedKeys.forEach(async key => {
        const ciphertext = await encryptMessage(message, key.sharedKey);
        const payload: ChatMessagePayload = {
          type: "Chat",
          deviceId: key.deviceId,
          ciphertext,
          to: receipientId,
        }

        socket.send(JSON.stringify(payload));
      });
    } catch (err) {
      console.error("Failed to send message", err);
    }
  }

  const decryptReceivedChatMessage = useCallback(async (data: ChatReceipientPayload) => {
    try {
      const publicKeys = await getPublicKeysByUserId(data.payload.from.userId, data.payload.from.deviceId);
      const sharedKeys = await deriveSharedKeys(publicKeys);

      const { ciphertext, ...rest } = data.payload;
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

  return (
    <ChatContext.Provider value={{ sendMessageToUser }}>
      {children}
    </ChatContext.Provider>
  )
}
