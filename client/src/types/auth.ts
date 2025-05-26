import type { LoginFormInputs } from "./form";

export type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
  login: (data: LoginFormInputs) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

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
