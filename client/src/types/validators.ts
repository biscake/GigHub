import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { type RegisterOptions } from "react-hook-form";

export type InputValidation = InputHTMLAttributes<HTMLInputElement> & {
  validation: RegisterOptions;
  name: string;
}

export type TextAreaValidation = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  validation: RegisterOptions;
  name: string;
}

export type hasPasswordField = {
  password: string;
}
