import { type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../lib/api";
import type { GetPublicKeysResponse } from "../types/api";
import type { ImportedPublicKey, PublicKey } from "../types/key";
import { deriveEDCHSharedKey, encryptMessage, importEDCHJwk } from "../utils/crypto";
import { useE2EE } from "../hooks/useE2EE";
import { ChatContext } from "./ChatContext";

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { privateKey } = useE2EE();

  const getPublicKeysByUserId = async (userId: number): Promise<ImportedPublicKey[] | undefined> => {
    try {
      const res = await api.get<GetPublicKeysResponse>(`/api/keys/public/${userId}`);

      const publicKeys: PublicKey[] = res.data.publicKeys;
      
      const importedKey = await Promise.all(
        publicKeys.map(async key => {
          const importedKey: ImportedPublicKey = {
            deviceId: key.deviceId,
            publicKey: await importEDCHJwk(key.publicKey)

          }
          return importedKey;
        })
      );

      return importedKey;
    } catch (err) {
      console.error("Failed to get public keys", err);
    }
  }

  const deriveSharedKeys = async (publicKeys: ImportedPublicKey[]) => {
    try {
      if (!privateKey) throw new Error("Private key not initialized");

      const sharedKeys = await Promise.all(
        publicKeys.map(async entry => ({ deviceId: entry.deviceId, sharedKey: await deriveEDCHSharedKey(privateKey, entry.publicKey) }))
      );

      return sharedKeys;
    } catch {
      console.log("Failed to derive shared keys");
    }
  }

  const sendMessageToUser = async (message: string, receipientId: number, socket: WebSocket) => {
    try {
      if (!user) throw new Error("User not logged in");

      const publicKeys = await getPublicKeysByUserId(receipientId);
      if (!publicKeys) {
        throw new Error("Failed to get public keys");
      }

      const sharedKeys = await deriveSharedKeys(publicKeys);
      if (!sharedKeys) {
        throw new Error("Failed to dervice shared keys");
      }

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

  return (
    <ChatContext.Provider value={{ sendMessageToUser }}>
      {children}
    </ChatContext.Provider>
  )
}
