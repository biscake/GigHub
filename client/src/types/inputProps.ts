import type { InputHTMLAttributes } from 'react';
import { type RegisterOptions } from 'react-hook-form';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  validation?: RegisterOptions;
  name: string;
}

export type CheckBoxProp = React.InputHTMLAttributes<HTMLInputElement> & {
  text: string;
}

export type InputErrorProps = {
  message?: string;
}