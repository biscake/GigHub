import { useForm } from "react-hook-form";
import type { ValidationError } from "./api";
import type { Area } from "react-easy-crop";

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
  setCroppedImagePixels: React.Dispatch<React.SetStateAction<Area | null>>;
}

export type CreateGigFormInputs = {
  title: string;
  price: number;
  description: string;
  file: Buffer;
}