import type { EncryptedE2eeKey } from "../types/crypto";

// use pbkdf2 to derive a key from user's password
const deriveKeyFromPassword = async (salt: Uint8Array, password: string): Promise<CryptoKey> => {
  const textEncoder = new TextEncoder();
  const passwordBuffer = textEncoder.encode(password);
  const importedKey = await crypto.subtle.importKey("raw", passwordBuffer, "PBKDF2", false, ["deriveKey"]);

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: salt,
      iterations: 100000
    },
    importedKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  return derivedKey;
}

const generateSalt = () => {
  return crypto.getRandomValues(new Uint8Array(16));
}

// encrypt e2ee private key with derived key from user's password
export const encryptE2eePrivateKey = async (password: string, privateKey: JsonWebKey): Promise<EncryptedE2eeKey> => {
  const salt = generateSalt();
  const derivedKey = await deriveKeyFromPassword(salt, password);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const privateKeyBuffer = new TextEncoder().encode(JSON.stringify(privateKey));

  const encryptedKey = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv
    },
    derivedKey,
    privateKeyBuffer
  );

  return { salt, iv, encryptedKey };
}

// decrypt e2ee private key with user's password and stored hash and iv
export const decryptE2eePrivateKey = async (salt: Uint8Array, iv: Uint8Array, encryptedKey: ArrayBuffer, password: string): Promise<JsonWebKey> => {
  const derivedKey = await deriveKeyFromPassword(salt, password);

  const decryptedKey = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    derivedKey,
    encryptedKey
  )

  const decoder = new TextDecoder();

  const decrypted = decoder.decode(decryptedKey);

  return JSON.parse(decrypted);
}

export const generateKeyPair = async () => {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: "SHA-256"
    },
    true,
    ["encrypt", "decrypt"]
  );

  const publicKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);

  return {
    publicKey: publicKeyJwk,
    privateKey: privateKeyJwk
  };
};