import { useEffect, useRef, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../lib/api";
import type { GetPublicKeysResponse, GetSinglePublicKeyResponse } from "../types/api";
import type { ImportedPublicKey, PublicKey } from "../types/key";
import { deriveEDCHSharedKey, encryptMessage, importEDCHJwk } from "../utils/crypto";
import { useE2EE } from "../hooks/useE2EE";
import { ChatContext } from "./ChatContext";

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { privateKey, deviceId } = useE2EE();
  const { accessToken } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);

  // connects client to websocket
  useEffect(() => {
    if (!accessToken && !deviceId) return;

    socketRef.current = new WebSocket(`ws://localhost:3000/ws?token=${accessToken}&deviceId=${deviceId}`);

    socketRef.current.onopen = () => {
      console.log("WebSocket connected");
    };

    socketRef.current.onclose = () => {
      console.log("WebSocket disconnected");
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received:", data);
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

  const deriveSharedKeys = async (publicKeys: ImportedPublicKey[]) => {
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
  }

  const sendMessageToUser = async (message: string, receipientId: number) => {
    try {
      if (!user) throw new Error("User not logged in");
      if (!socketRef.current) throw new Error("WebSocket not connected");

      const socket = socketRef.current
      const publicKeys = await getPublicKeysByUserId(receipientId);
      const sharedKeys = await deriveSharedKeys(publicKeys);

      sharedKeys.forEach(async key => {
        const ciphertext = await encryptMessage(message, key.sharedKey);

        socket.send(JSON.stringify({
          type: "Chat",
          deviceId: key.deviceId,
          ciphertext,
          to: receipientId,
          from: user.id
        }))
      });
    } catch (err) {
      console.error(err);
    }
  }

  const decryptMessageFromUser = async (ciphertext: string, senderId: number) => {
    if (!user) throw new Error("User not logged in");
    if (!socketRef.current) throw new Error("WebSocket not connected");

    const socket = socketRef.current
    const publicKeys = await getPublicKeysByUserId(senderId, );
    const sharedKeys = await deriveSharedKeys(publicKeys);
    
  }

  return (
    <ChatContext.Provider value={{ sendMessageToUser }}>
      {children}
    </ChatContext.Provider>
  )
}
