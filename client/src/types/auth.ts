export type AuthContextType = {
  user: string | null;
  login: (username: string) => void;
  logout: () => void;
}

export type User = {
  id: string;
  email: string;
  username: string;
}