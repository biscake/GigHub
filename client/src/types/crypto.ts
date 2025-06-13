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

export interface DeviceIdAndSecret {
  deviceId: string;
  deviceSecret: CryptoKey;
}

export interface StoredE2EEEntry {
  userId: number;
  deviceId: string;
  wrappedDerivedKey: ArrayBuffer;
  deviceSecret: CryptoKey;
  salt: Uint8Array;
  iv: Uint8Array;
  encryptedPrivateKey: ArrayBuffer;
}