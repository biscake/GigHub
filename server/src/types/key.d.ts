export interface GetKeysByUserAndDeviceIdParams {
  deviceId: string;
  userId: number;
}

export interface UpdateDeviceKeysParams {
  encryptedPrivateKey: string;
  publicKey: string;
  deviceId: string;
  userId: number;
  iv: string;
  salt: string;
}

export interface GetPublicKeysByUserIdParams {
  userId: number;
  deviceId?: string;
}