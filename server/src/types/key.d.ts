export interface GetDeviceByDeviceIdParams {
  deviceId: string;
}

export interface StoreNewDeviceByUserIdParams {
  encryptedPrivateKey: string;
  publicKey: string;
  deviceId: string;
  userId: number;
  iv: string;
  salt: string;
}

export interface GetPublicKeysByUserIdParams {
  userId: number;
}