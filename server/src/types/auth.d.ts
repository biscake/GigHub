export type registerInput = {
  username: string;
  email: string;
  pwHash: string;
}

export type loginInput = {
  username: string;
  password: string;
  remember: boolean;
}

export type rotateTokenInput = {
  refreshToken: string;
}

export type logoutInput = {
  token: string;
}