import type { InputHTMLAttributes } from 'react';
import type { Area } from 'react-easy-crop';
import type { RegisterOptions, UseFormRegister } from 'react-hook-form';
import type { CreateGigFormInputs } from './form';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  validation?: RegisterOptions;
  name: string;
}

export type CheckBoxProp = React.InputHTMLAttributes<HTMLInputElement> & {
  text: string;
  name: string;
}

export type TextAreaProps = React.InputHTMLAttributes<HTMLTextAreaElement> & {
  name: string;
  validation?: RegisterOptions;
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

export type PageSelectorProp = {
  currentPage: number;
  totalPages: number;
  handlePageChange: (value: number) => void;
}