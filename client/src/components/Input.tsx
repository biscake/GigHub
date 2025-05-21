import { useFormContext, type FieldError } from 'react-hook-form';
import type { InputErrorProps, InputProps } from '../types/inputProps';

export const Input: React.FC<InputProps> = (props) => {
  const { register, formState: { errors } } = useFormContext();

  const inputError = errors[props.name] as FieldError | undefined;

  return (
    <div>
      <label className="flex flex-row">
        <input
          {...props}
          {...register(props.name, props.validation)}
        />
      </label>
      {inputError?.message && <InputError message={inputError.message} />}
    </div>
  )
}

const InputError : React.FC<InputErrorProps> = ({ message }) => {
  return (
    <span className="text-rose-400 text-sm">{message}</span>
  )
}