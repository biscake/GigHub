import { type ReactNode, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useIdempotencyKey } from "../hooks/useIdempotencyKey";
import api from "../lib/api";
import { getEncryptedE2eeEntry, storeEncryptedE2eeKey } from "../lib/indexeddb";
import type { GetPublicKeysResponse } from "../types/api";
import type { User } from "../types/auth";
import type { EncryptedE2EEKeyResponse, StoredE2EEEntry } from "../types/crypto";
import type { ImportedPublicKey, PublicKey } from "../types/key";
import { decryptJwk, deriveEDCHSharedKey, derivePBKDF2Key, encryptJwk, encryptMessage, generateDeviceIdAndSecret, generateEDCHKeyPair, generateSalt, importEDCHJwk, unwrapDerivedKey, wrapDerivedKey } from "../utils/crypto";
import { arrayBufferToBase64, base64ToArrayBuffer, base64ToUint8, Uint8ToBase64 } from "../utils/utils";
import { E2EEContext } from "./E2EEContext";

export const E2EEProvider = ({ children }: { children: ReactNode }) => {
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const { user } = useAuth();
  const idempotencyKey = useIdempotencyKey();

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

  useEffect(() => {
    // get encrypted private key and device details from indexeddb if exist 
    // else if does not exist, get encrypted private key from server
    // derive pbkdf2key using stored salt and user's password
    // wrap derived key with device secret
    const initKeyWithPassword = async (password: string): Promise<void> => {
      if (!user) return;
  
      const data: StoredE2EEEntry = await getEncryptedE2eeEntry(user.id);
  
      if (data && data.deviceId && data.deviceSecret && data?.userId) {
        try {
          const res = await api.get<EncryptedE2EEKeyResponse>(`/api/keys/private/${data.deviceId}`);
          data.encryptedPrivateKey = base64ToArrayBuffer(res.data.encryptedPrivateKey);
          data.salt = base64ToUint8(res.data.salt);
          data.iv = base64ToUint8(res.data.iv);
        } catch {
          console.error("Failed to get encrypted E2EE private key from server");
        }
      }
  
      if (!data || !data.deviceId || !data.deviceSecret
        || !data.encryptedPrivateKey || !data.iv
        || !data.salt || !data.userId 
       ) {
         throw new Error("Missing or corrupted key");
       }
  
      // derive pbkdf2
      const pbkdf2Key = await derivePBKDF2Key(password, data.salt);
      const wrappedKey = await wrapDerivedKey(pbkdf2Key, data.deviceSecret);
      data.wrappedDerivedKey = wrappedKey;
  
      await storeEncryptedE2eeKey(data);
  
      const decryptedPrivateKey = await decryptJwk(data.encryptedPrivateKey, pbkdf2Key, data.iv);
      setPrivateKey(decryptedPrivateKey);
      setDeviceId(data.deviceId);
      setPassword(null);
    }

    // get encrypted private key and device details from indexeddb if exist 
    // else if does not exist, get encrypted private key from server
    // unwrap derived key with device secret 
    // decrypt encrypted private key with unwrapped derived key
    const initKeyWithoutPassword = async (): Promise<void> => {
      if (!user) return;

      const data: StoredE2EEEntry = await getEncryptedE2eeEntry(user.id);

      // retrieve encrypted private key from server using device id if deviceId, deviceSecret and wrappedDerivedKey exist
      if (!(data && data?.encryptedPrivateKey && data?.iv && data?.salt)) {
        if (data?.deviceId && data?.deviceSecret && data?.wrappedDerivedKey && data?.userId) {
          try {
            const res = await api.get<EncryptedE2EEKeyResponse>(`/api/keys/private/${data.deviceId}`);
            data.encryptedPrivateKey = base64ToArrayBuffer(res.data.encryptedPrivateKey);
            data.salt = base64ToUint8(res.data.salt);
            data.iv = base64ToUint8(res.data.iv);
          } catch {
            console.error("Failed to get encrypted E2EE private key from server");
          }
        }
      }

      if (!data || !data.deviceId || !data.deviceSecret
        || !data.encryptedPrivateKey || !data.iv
        || !data.salt || !data.userId
      ) {
        throw new Error("Missing or corrupted key");
      }
      
      if (!data.wrappedDerivedKey) {
        throw new Error("Wrapped key missing");
      }
      
      await storeEncryptedE2eeKey(data);

      // decrypt private key
      const unwrappedKey = await unwrapDerivedKey(data.wrappedDerivedKey, data.deviceSecret);
      const decryptedPrivateKey = await decryptJwk(data.encryptedPrivateKey, unwrappedKey, data.iv);
      setPrivateKey(decryptedPrivateKey);
      setDeviceId(data.deviceId);
    }

    // generate deviceId, deviceSecret and a elliptic curve diffie hellman keypair
    // use user's password to derive key
    // encrypt private key with derived key
    // wrap derived key with device secret
    const initNewDevice = async (password: string, user: User): Promise<void> => {
      if (!password) throw new Error("Encryption password is null");
  
      const { deviceId, deviceSecret } = await generateDeviceIdAndSecret();
  
      const keyPair = await generateEDCHKeyPair();
      const derivedKeySalt = generateSalt();
      const derivedKey = await derivePBKDF2Key(password, derivedKeySalt);
      const encryptedResult = await encryptJwk(keyPair.privateKey, derivedKey);
      const wrappedDerivedKey = await wrapDerivedKey(derivedKey, deviceSecret);
  
      const e2eeData: StoredE2EEEntry = {
        userId: user.id,
        deviceId,
        wrappedDerivedKey,
        deviceSecret,
        salt: derivedKeySalt,
        iv: encryptedResult.iv,
        encryptedPrivateKey: encryptedResult.encryptedPrivateKey
      }
  
      await storeEncryptedE2eeKey(e2eeData);
  
      api.post('/api/keys',
        {
          privateKey: {
            iv: Uint8ToBase64(e2eeData.iv),
            encryptedPrivateKey: arrayBufferToBase64(e2eeData.encryptedPrivateKey),
            salt: Uint8ToBase64(derivedKeySalt),
          },
          publicKey: keyPair.publicKey,
          deviceId: e2eeData.deviceId,
          userId: user.id
        }
        ,
        {
        headers: {
          'Content-Type': "application/json",
          'Idempotency-Key': idempotencyKey.get()
        }
      }).finally(() => idempotencyKey.clear());

      const importedPrivateKey = await importEDCHJwk(keyPair.privateKey);
      setPrivateKey(importedPrivateKey);
      setDeviceId(e2eeData.deviceId);
      setPassword(null);
    }

    const runInitKeys = async () => {
      if (!user) return;
  
      console.log("Initializing key...",);
  
      try {
        if (password) {
          await initKeyWithPassword(password);
        } else {
          await initKeyWithoutPassword();
        }
      } catch (err) {
        if (err instanceof Error && err.message === "Missing or corrupted key" && password) {
          console.error("Key initialization failed, registering as new device...");
          await initNewDevice(password, user);
        } else {
          console.error(err);
        }
      }
    };
  
    runInitKeys();
  }, [user]);

  return (
    <E2EEContext.Provider value={{ privateKey, setPassword, sendMessageToUser, deviceId }}>
      {children}
    </E2EEContext.Provider>
  )
}
