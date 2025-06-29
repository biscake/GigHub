import type { EncryptedE2EEKey } from "../types/crypto";
import { base64ToUint8, Uint8ToBase64 } from "./utils";

// use pbkdf2 to derive a key from user's password + device secret
export const derivePBKDF2Key = async (password: string, keySalt: Uint8Array): Promise<CryptoKey> => {
  const textEncoder = new TextEncoder();

  const passwordBuffer = textEncoder.encode(password);
  const importedKey = await crypto.subtle.importKey("raw", passwordBuffer, "PBKDF2", false, ["deriveKey"]);

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: keySalt,
      iterations: 100000
    },
    importedKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  return derivedKey;
}

// wrap derived key using wrapping key
export const wrapDerivedKey = async (derivedKey: CryptoKey, wrappingKey: CryptoKey): Promise<ArrayBuffer> => {
  const wrappedKey = await crypto.subtle.wrapKey(
    "raw",
    derivedKey,
    wrappingKey,
    {
      name: "AES-KW",
    }
  );

  return wrappedKey;
}

// unwrap derived key using wrapping key
export const unwrapDerivedKey = async (wrappedDerivedKey: ArrayBuffer, wrappingKey: CryptoKey): Promise<CryptoKey> => {
  return crypto.subtle.unwrapKey(
    "raw",
    wrappedDerivedKey,
    wrappingKey,
    { name: "AES-KW" },
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}
  
export const generateSalt = () => {
  return crypto.getRandomValues(new Uint8Array(16));
}

// encrypt e2ee private key with derived key from user's password
export const encryptJwk = async (privateKey: JsonWebKey, encryptionKey: CryptoKey): Promise<EncryptedE2EEKey> => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const privateKeyBuffer = new TextEncoder().encode(JSON.stringify(privateKey));

  const encryptedKey = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv
    },
    encryptionKey,
    privateKeyBuffer
  );

  return { iv, encryptedPrivateKey: encryptedKey };
}

// import ECDH jwk
export const importECDHJwk = async (jwk: JsonWebKey) => {
  const isPublicKey = jwk.d === undefined;
  
  if (!jwk.key_ops) {
    jwk.key_ops = isPublicKey ? [] : ["deriveKey"];
  }

  const importedKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "ECDH",
      namedCurve: "P-521",
    },
    true,
    isPublicKey ? [] : ["deriveKey"]
  );

  return importedKey;
}

// decrypt e2ee private key with user's password and stored hash and iv
export const decryptJwk = async (encryptedPrivateKey: ArrayBuffer, decryptionKey: CryptoKey, iv: Uint8Array): Promise<CryptoKey> => {
  const decryptedKey = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv
    },
    decryptionKey,
    encryptedPrivateKey
  )

  const decoder = new TextDecoder();

  const jwk = JSON.parse(decoder.decode(decryptedKey));

  return importECDHJwk(jwk);
}

// generate elliptic curve diffie hellman key pair
export const generateECDHKeyPair = async () => {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-521"
    },
    true,
    ["deriveKey"]
  );

  const publicKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
  publicKeyJwk.key_ops = [];
  privateKeyJwk.key_ops = ["deriveKey"];

  return {
    publicKey: publicKeyJwk,
    privateKey: privateKeyJwk
  };
};

// device secret key that is used to wrap derived PBKDF2 key
export const generateDeviceSecret = async (): Promise<CryptoKey> => {
  const deviceSecret = await crypto.subtle.generateKey(
    { name: "AES-KW", length: 256 },
    false,
    ["wrapKey", "unwrapKey"]
  );

  return deviceSecret;
}

// use user's private key and recipient's public key to derive a shared key between user and recipient
export const deriveECDHSharedKey = async (privateKey: CryptoKey, publicKey: CryptoKey): Promise<CryptoKey> => {
  return crypto.subtle.deriveKey(
    {
      name: "ECDH",
      public: publicKey
    },
    privateKey,
    {
      name: "AES-GCM",
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  )
}

// encrypt message using a CryptoKey
export const encryptMessage = async (message: string, sharedKey: CryptoKey): Promise<string | null> => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const messageBuffer = new TextEncoder().encode(message);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    sharedKey,
    messageBuffer
  )

  const concatenated = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  concatenated.set(iv, 0)
  concatenated.set(new Uint8Array(ciphertext), iv.byteLength);

  // convert uint8 to base64
  return Uint8ToBase64(concatenated);
}

// decrypt message using a CryptoKey
export const decryptMessage = async (encryptedMessage: string, sharedKey: CryptoKey): Promise<string | null> => {
  const encryptedBytes = base64ToUint8(encryptedMessage); 

  if (!encryptedBytes) {
    return null;
  }
  
  const iv = encryptedBytes.slice(0, 12);
  const ciphertext = encryptedBytes.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    sharedKey,
    ciphertext
  )

  return new TextDecoder().decode(decrypted);
}