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
