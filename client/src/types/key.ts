export type PublicKey = {
  publicKey: JsonWebKey;
  deviceId: string;
}

export type ImportedPublicKey = {
  publicKey: CryptoKey;
  deviceId: string;
  userId: number;
}