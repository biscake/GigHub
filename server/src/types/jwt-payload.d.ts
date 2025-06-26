export interface JwtPayload {
  sub: number;
  username: string;
  deviceId: string;
  iat: number;
  iss: string;
  aud: string;
}
