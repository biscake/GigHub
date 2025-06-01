export interface JwtPayload {
  sub: number;
  username: string;
  iat: number;
  iss: string;
  aud: string;
}
