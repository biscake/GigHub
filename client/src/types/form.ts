import { useForm } from "react-hook-form";
import type { ValidationError } from "./api";

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

export type ResetPasswordFormInputs = {
  password: string;
  cpassword: string;
}

export type hasPasswordField = {
  password: string;
}

export type CreateGigFormProps = {
  apiErr: string | ValidationError[] | null;
  methods: ReturnType<typeof useForm<CreateGigFormInputs>>;
  image: string | null;
  setImage: React.Dispatch<React.SetStateAction<string | null>>;
  setCroppedImage: React.Dispatch<React.SetStateAction<string | null>>;
}

export type CreateGigFormInputs = {
  title: string;
  price: number;
  description: string;
  file: Buffer;
}