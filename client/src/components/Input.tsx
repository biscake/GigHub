import { useFormContext, type FieldError } from 'react-hook-form';
import type { InputProps } from '../types/inputProps';

export const Input: React.FC<InputProps> = ({ 
  type, 
  id, 
  placeholder, 
  name, 
  validation, 
  autocomplete = 'off',
  className,
}) => {
  const { register, formState: { errors } } = useFormContext();

  const inputError = errors[name] as FieldError | undefined;

  return (
    <div>
      <label className="flex flex-row">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          {...register(name, validation)}
          autoComplete={autocomplete}
          className={className}
        />
      </label>
      {inputError?.message && <InputError message={inputError.message} />}
    </div>
  )
}

type InputErrorProps = {
  message?: string;
}

const InputError : React.FC<InputErrorProps> = ({ message }) => {
  return (
    <span className="text-rose-400 text-sm">{message}</span>
  )
}