import type { InputHTMLAttributes } from 'react';
import type { RegisterOptions, UseFormRegister } from 'react-hook-form';
import type { CreateGigFormInputs } from './form';
import type { Area } from 'react-easy-crop';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  validation?: RegisterOptions;
  name: string;
}

export type CheckBoxProp = React.InputHTMLAttributes<HTMLInputElement> & {
  text: string;
}

export type TextAreaProps = React.InputHTMLAttributes<HTMLTextAreaElement> & {
  register: UseFormRegister<CreateGigFormInputs>;
  name: keyof CreateGigFormInputs;
}

export type UploadFileProps = React.InputHTMLAttributes<HTMLInputElement> & {
  register: UseFormRegister<CreateGigFormInputs>;
  name: keyof CreateGigFormInputs;
  image: string | null;
  setImage: React.Dispatch<React.SetStateAction<string | null>>;
  setCroppedImagePixels: React.Dispatch<React.SetStateAction<Area | null>>;
}

export type SearchBarProp = {
  placeholder: string;
  handleSearch: (value : string) => void;
}