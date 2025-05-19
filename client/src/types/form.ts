export type LoginFormInputs = {
  username: string;
  password: string;
  rememberMe: boolean;
}

export type SignupFormInputs = {
  username: string;
  email: string;
  password: string;
  cpassword: string;
}

export type ResetRequestFormInputs = {
  email: string;
}