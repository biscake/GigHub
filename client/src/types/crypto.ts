export interface EncryptedE2eeKey {
  salt: Uint8Array;
  iv: Uint8Array;
  encryptedKey: ArrayBuffer;
}