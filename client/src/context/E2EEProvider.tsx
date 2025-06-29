import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useIdempotencyKey } from "../hooks/useIdempotencyKey";
import api from "../lib/api";
import { getEncryptedE2EEEntry, getUserDeviceE2EEPublicKey, storeE2EEPublicKey, storeEncryptedE2EEKey } from "../lib/indexeddb";
import type { User } from "../types/auth";
import type { EncryptedE2EEKeyResponse, StoredE2EEEntry } from "../types/crypto";
import { decryptJwk, decryptMessage, deriveECDHSharedKey, derivePBKDF2Key, encryptJwk, generateDeviceSecret, generateECDHKeyPair, generateSalt, importECDHJwk, unwrapDerivedKey, wrapDerivedKey } from "../utils/crypto";
import { arrayBufferToBase64, base64ToArrayBuffer, base64ToUint8, Uint8ToBase64 } from "../utils/utils";
import { E2EEContext } from "./E2EEContext";
import type { DerivedSharedKey, ImportedPublicKey, PublicKey, StoredE2EEPublicKey } from "../types/crypto";
import type { GetConversationParticipantsResponse, GetPublicKeysResponse } from "../types/api";
import type { Participant, StoredMessage } from "../types/chat";

export const E2EEProvider = ({ children }: { children: ReactNode }) => {
  const privateKey = useRef<CryptoKey | null>(null);
  const { user, deviceIdRef, password, setPassword } = useAuth();
  const { get, clear } = useIdempotencyKey();
  const [loading, setLoading] = useState(true);
  const initRef = useRef(false);

  // get encrypted private key and device details from indexeddb if exist 
  // else if does not exist, get encrypted private key from server
  // derive pbkdf2key using stored salt and user's password
  // wrap derived key with device secret
  const initKeyWithPassword = useCallback(async (password: string): Promise<CryptoKey | null> => {
    const deviceId = deviceIdRef.current;
    if (!user || !deviceId) return null;

    const data: StoredE2EEEntry = await getEncryptedE2EEEntry(user.id);

    if (data && data.deviceSecret && data?.userId) {
      try {
        const res = await api.get<EncryptedE2EEKeyResponse>(`/api/keys/private/${deviceId}`);
        data.encryptedPrivateKey = base64ToArrayBuffer(res.data.encryptedPrivateKey);
        data.salt = base64ToUint8(res.data.salt);
        data.iv = base64ToUint8(res.data.iv);
      } catch (err) {
        console.error("Failed to get encrypted E2EE private key from server", err);
      }
    }

    if (!data || !data.deviceSecret
      || !data.encryptedPrivateKey || !data.iv
      || !data.salt || !data.userId 
    ) {
      throw new Error("Missing or corrupted key");
    }

    // derive pbkdf2
    const pbkdf2Key = await derivePBKDF2Key(password, data.salt);
    const wrappedKey = await wrapDerivedKey(pbkdf2Key, data.deviceSecret);
    data.wrappedDerivedKey = wrappedKey;

    await storeEncryptedE2EEKey(data);

    const decryptedPrivateKey = await decryptJwk(data.encryptedPrivateKey, pbkdf2Key, data.iv);
    setPassword(null);
    return decryptedPrivateKey;
  }, [user, setPassword, deviceIdRef])

  // get encrypted private key and device details from indexeddb if exist 
  // else if does not exist, get encrypted private key from server
  // unwrap derived key with device secret 
  // decrypt encrypted private key with unwrapped derived key
  const initKeyWithoutPassword = useCallback(async (): Promise<CryptoKey | null> => {
    const deviceId = deviceIdRef.current;
    if (!user || !deviceId) return null;

    const data: StoredE2EEEntry = await getEncryptedE2EEEntry(user.id);

    // retrieve encrypted private key from server using device id if deviceId, deviceSecret and wrappedDerivedKey exist
    if (!data || !data?.encryptedPrivateKey || !data?.iv || !data?.salt) {
      if (data?.deviceSecret && data?.wrappedDerivedKey && data?.userId) {
        try {
          const res = await api.get<EncryptedE2EEKeyResponse>(`/api/keys/private/${deviceId}`);

          data.encryptedPrivateKey = base64ToArrayBuffer(res.data.encryptedPrivateKey);
          data.salt = base64ToUint8(res.data.salt);
          data.iv = base64ToUint8(res.data.iv);
        } catch {
          console.error("Failed to get encrypted E2EE private key from server");
        }
      }
    }

    if (!data || !data.deviceSecret
      || !data.encryptedPrivateKey || !data.iv
      || !data.salt || !data.userId
    ) {
      throw new Error("Missing or corrupted key");
    }
    
    if (!data.wrappedDerivedKey) {
      throw new Error("Wrapped key missing");
    }
    
    await storeEncryptedE2EEKey(data);

    // decrypt private key
    const unwrappedKey = await unwrapDerivedKey(data.wrappedDerivedKey, data.deviceSecret);
    const decryptedPrivateKey = await decryptJwk(data.encryptedPrivateKey, unwrappedKey, data.iv);
    return decryptedPrivateKey
  }, [user, deviceIdRef])

  // generate deviceId, deviceSecret and a elliptic curve diffie hellman keypair
  // use user's password to derive key
  // encrypt private key with derived key
  // wrap derived key with device secret
  const initNewDevice = useCallback(async (password: string, user: User): Promise<CryptoKey | null> => {
    const deviceId = deviceIdRef.current;
    if (!user || !deviceId) return null;
    if (!password) throw new Error("Encryption password is null");

    const deviceSecret = await generateDeviceSecret();
    const keyPair = await generateECDHKeyPair();
    const derivedKeySalt = generateSalt();
    const derivedKey = await derivePBKDF2Key(password, derivedKeySalt);
    const encryptedResult = await encryptJwk(keyPair.privateKey, derivedKey);
    const wrappedDerivedKey = await wrapDerivedKey(derivedKey, deviceSecret);

    const e2eeData: StoredE2EEEntry = {
      userId: user.id,
      wrappedDerivedKey,
      deviceSecret,
      salt: derivedKeySalt,
      iv: encryptedResult.iv,
      encryptedPrivateKey: encryptedResult.encryptedPrivateKey
    }

    if (!derivedKeySalt || !encryptedResult.iv || !encryptedResult.encryptedPrivateKey || !deviceSecret) return null;

    await storeEncryptedE2EEKey(e2eeData);

    try {
      if (!e2eeData.iv || !e2eeData.encryptedPrivateKey || !e2eeData.salt) throw new Error("Corrupted data");
      
      api.post('/api/keys',
        {
          privateKey: {
            iv: Uint8ToBase64(e2eeData.iv),
            encryptedPrivateKey: arrayBufferToBase64(e2eeData.encryptedPrivateKey),
            salt: Uint8ToBase64(derivedKeySalt),
          },
          publicKey: keyPair.publicKey,
          deviceId: deviceId,
          userId: user.id
        }
        ,
        {
        headers: {
          'Content-Type': "application/json",
          'Idempotency-Key': get()
        }
      })
    } catch (err) {
      console.error(err);
    } finally {
      clear();
    }

    const importedPrivateKey = await importECDHJwk(keyPair.privateKey);
    setPassword(null);
    return importedPrivateKey;
  }, [deviceIdRef, clear, get, setPassword])

  const getUserPublicKeys = useCallback(async (userId: number, deviceId?: string): Promise<ImportedPublicKey[]> => {
    try {
      const res = await api.get<GetPublicKeysResponse>(`/api/keys/public/${userId}`, {
        params: {
          deviceId
        }
      });

      const publicKeys = res.data.publicKeys;
      
      const importedKey = await Promise.all(
        publicKeys.map(async key => {
          const importedKey: ImportedPublicKey = {
            deviceId: key.deviceId,
            publicKey: await importECDHJwk(key.publicKey),
            userId
          }

          const toStore: StoredE2EEPublicKey = {
            deviceId: key.deviceId,
            publicKey: key.publicKey,
            userId
          }

          await storeE2EEPublicKey(toStore);
          
          return importedKey;
        })
      );
      
      return importedKey;
    } catch (err) {
      console.error("Failed to get public keys", err);
      return [];
    }
  }, [])

  const getAllPublicKeysConversation = useCallback(async (conversationKey: string): Promise<ImportedPublicKey[]> => {
    try {
      const res = await api.get<GetConversationParticipantsResponse>(`/api/chat/conversations/${conversationKey}`);
      
      const participants: Participant[] = res.data.participants;
      
      const importedKey = await Promise.all(
        participants.map(async p => {
          const importedKey: ImportedPublicKey = {
            deviceId: p.deviceId,
            publicKey: await importECDHJwk(p.publicKey),
            userId: p.userId
          }

          const toStore: StoredE2EEPublicKey = {
            deviceId: p.deviceId,
            publicKey: p.publicKey,
            userId: p.userId
          }

          await storeE2EEPublicKey(toStore);
          
          return importedKey;
        })
      );
      
      return importedKey;
    } catch (err) {
      console.error("Failed to get public keys", err);
      return [];
    }
  }, [])

  const getUserDevicePublicKey = useCallback(async (userId: number, deviceId: string): Promise<ImportedPublicKey[]> => {
    let key: StoredE2EEPublicKey | PublicKey | null = (await getUserDeviceE2EEPublicKey(userId, deviceId));

    if (!key) {
      try {
        const res = await api.get<GetPublicKeysResponse>(`/api/keys/public/${userId}`, {
          params: {
            deviceId
          } 
        });

        const data = res.data.publicKeys[0];
        key = data;

        const toStore: StoredE2EEPublicKey = {
          ...data,
          userId
        }
    
        await storeE2EEPublicKey(toStore);
      
      } catch {
        return [];
      }
    }

    if (!key) throw new Error("Unable to get public key")

    const importedKey: ImportedPublicKey = {
      deviceId: key.deviceId,
      publicKey: await importECDHJwk(key.publicKey),
      userId
    }

    return [ importedKey ];
  }, [])

  const deriveSharedKeys = useCallback(async (publicKeys: ImportedPublicKey[]): Promise<DerivedSharedKey[]> => {
    try {
      const key = privateKey.current;
      if (!key) throw new Error("Private key not initialized");

      const sharedKeys = await Promise.all(
        publicKeys.map(async entry => ({ deviceId: entry.deviceId, sharedKey: await deriveECDHSharedKey(key, entry.publicKey), userId: entry.userId }))
      );

      return sharedKeys;
    } catch (err) {
      console.error("Failed to derive shared keys", err);
      throw err;
    }
  }, [])

  const decryptCiphertext = useCallback(async (data: StoredMessage): Promise<string | null> => {
    try {
      const publicKeys = await getUserDevicePublicKey(data.from.userId, data.from.deviceId);
      const sharedKeys = await deriveSharedKeys(publicKeys);

      const { ciphertext } = data;

      const text = await decryptMessage(ciphertext, sharedKeys[0].sharedKey);
      return text;
    } catch {
      return null;
    }
  }, [deriveSharedKeys, getUserDevicePublicKey])

  useEffect(() => {
    if (initRef.current) return;

    if (!user) {
      setLoading(false);
      return;
    }

    initRef.current = true;

    const runInitKeys = async () => {
      console.log("Initializing key...",);
      let key: CryptoKey | null = null;
      try {
        if (password) {
          key = await initKeyWithPassword(password);
        } else {
          key = await initKeyWithoutPassword();
        }
      } catch (err) {
        if (err instanceof Error && err.message === "Missing or corrupted key" && password) {
          console.error("Key initialization failed, registering as new device...");
          key = await initNewDevice(password, user);
        } else {
          console.error(err);
        }
      } finally {
        privateKey.current = key;
        initRef.current = false;
        setLoading(false);
      }
    };
  
    runInitKeys();
  }, [user, initKeyWithPassword, initKeyWithoutPassword, initNewDevice, password, setPassword]);

  return (
    <E2EEContext.Provider value={{ getAllPublicKeysConversation, getUserDevicePublicKey, deriveSharedKeys, decryptCiphertext, privateKey, getUserPublicKeys }}>
      {!loading && children}
    </E2EEContext.Provider>
  )
}
