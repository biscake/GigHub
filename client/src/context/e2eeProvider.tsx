import { type ReactNode, useState } from "react";
import { E2EEContext } from "./e2eeContext";
import api from "../lib/api";
import axios from "axios";
import { decryptE2eePrivateKey, encryptE2eePrivateKey, generateKeyPair } from "../utils/crypto";
import type { EncryptedE2eeKey } from "../types/crypto";
import { deleteEncryptedE2eeKey, retrieveEncryptedE2eeKey, storeEncryptedE2eeKey } from "../lib/indexeddb";

export const E2EEProvider = ({ children }: { children: ReactNode }) => {
  const [privateKey, setPrivateKey] = useState<JsonWebKey | null>(null);
  const [encryptionPassword, setEncryptionPassword] = useState<string | null>(null);

  // get encrypted private key from indexeddb if exist, decrypt private key
  // else if encrypted private key exists on server, retrieve it from server and decrypt 
  // else generate keypair, upload public key to server, encrypt private key using key generated from user's password
  // and upload public key and encrypted private key to server, store encrypted private key in indexeddb
  const initKeys = async (): Promise<void> => {
    if (!encryptionPassword) {
      throw new Error("Encryption password is null");
    }

    try {
      let retrievedEncryptedKey: EncryptedE2eeKey;

      try {
        retrievedEncryptedKey = await retrieveEncryptedE2eeKey();
      } catch {
        try {
          const res = await api.get<EncryptedE2eeKey>('/api/keys/private');
          retrievedEncryptedKey = res.data;
        } catch (err) {
          if (axios.isAxiosError(err) && err.response?.status === 404) {
            const keyPair = await generateKeyPair();
  
            setPrivateKey(keyPair.privateKey);
  
            const encryptedPrivateKey = await encryptE2eePrivateKey(encryptionPassword, keyPair.privateKey);
            
            await api.post('/api/keys', { privateKey: encryptedPrivateKey, publicKey: keyPair.publicKey }, {
              headers: {
                'Content-Type': "application/json"
            }})
  
            return;
          }
  
          throw err;
        }
      }
  
      const { salt, iv, encryptedKey } = retrievedEncryptedKey;
      const decryptedKey = await decryptE2eePrivateKey(salt, iv, encryptedKey, encryptionPassword);
      setPrivateKey(decryptedKey);
      await storeEncryptedE2eeKey(retrievedEncryptedKey);
    } catch (err) {
      console.error(err);
    } finally {
      setEncryptionPassword(null);
    }
  }

  const deleteKey = async (): Promise<void> => {
    setPrivateKey(null);
    setEncryptionPassword(null);
    await deleteEncryptedE2eeKey();
  };

  return (
    <E2EEContext.Provider value={{ initKeys, setEncryptionPassword, privateKey, deleteKey }}>
      {children}
    </E2EEContext.Provider>
  )
}
