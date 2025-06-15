export type User = {
  id: number;
  email?: string;
  username: string;
}

export interface JwtPayload {
  sub: number;
  username: string;
  iat: number;
  jti: string;
}
