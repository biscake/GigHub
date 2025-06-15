import type { SetStateAction } from "react";
import type { User } from "./auth";
import type { LoginFormInputs } from "./form";

export type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
  login: (data: LoginFormInputs) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export type ChatContextType = {
  sendMessageToUser: (message: string, receipientId: number) => Promise<void>;
}

export type E2EEContextType = {
  privateKey: CryptoKey | null;
  setPassword: React.Dispatch<SetStateAction<string | null>>;
  deviceId: string | null;
}
