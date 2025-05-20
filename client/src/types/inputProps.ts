import { type RegisterOptions } from 'react-hook-form';

export type InputProps = {
  type: string;
  id: string;
  placeholder?: string;
  name: string;
  validation?: RegisterOptions;
  autocomplete?: string;
  className?: string;
  text?: string;
};

export type CheckBoxProp = React.InputHTMLAttributes<HTMLInputElement> & {
  text: string;
}
