export interface EncryptedE2EEKey {
  iv: Uint8Array;
  encryptedPrivateKey: ArrayBuffer;
}

export interface EncryptedE2EEKeyWithSalt extends EncryptedE2EEKey {
  salt: Uint8Array;
}

export interface EncryptedE2EEKeyResponse {
  iv: string;
  encryptedPrivateKey: string;
  salt: string;
}

export interface StoredE2EEEntry {
  userId: number;
  wrappedDerivedKey: ArrayBuffer;
  deviceSecret: CryptoKey;
  salt: Uint8Array;
  iv: Uint8Array;
  encryptedPrivateKey: ArrayBuffer;
}

export type PublicKey = {
  publicKey: JsonWebKey;
  deviceId: string;
}

export type ImportedPublicKey = {
  publicKey: CryptoKey;
  deviceId: string;
  userId: number;
}

export type StoredE2EEPublicKey = {
  userId: number;
  publicKey: JsonWebKey;
  deviceId: string;
}

export type DerivedSharedKey = {
  deviceId: string;
  sharedKey: CryptoKey;
  userId: number;
}
