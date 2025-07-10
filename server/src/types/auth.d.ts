export type registerInput = {
  username: string;
  email: string;
  pwHash: string;
}

export type loginInput = {
  username: string;
  password: string;
  deviceId: string;
}

export type rotateTokenInput = {
  refreshToken: string;
}

export type logoutInput = {
  token: string;
}

export type resetRequestInput = {
  email: string;
}

export type resetPasswordInput = {
  resetToken: string;
  pwHash: string;
}