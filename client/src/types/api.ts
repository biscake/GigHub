import type { PublicKey } from "./key";

export type ValidationError = {
  msg: string;
}

export type ApiErrorResponse = {
  errors?: ValidationError[]; 
  message: string;
}

export type GetPublicKeysResponse = {
  publicKeys: PublicKey[];
}