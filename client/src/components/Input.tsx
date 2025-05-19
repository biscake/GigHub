import { useFormContext, type FieldError, type RegisterOptions } from 'react-hook-form';

type InputProps = {
  type: string;
  id: string;
  placeholder?: string;
  name: string;
  validation?: RegisterOptions;
  autocomplete?: string;
  className?: string;
  text?: string;
};

//TODO: add styling
export const Input : React.FC<InputProps> = ({ 
  type, 
  id, 
  placeholder, 
  name, 
  validation, 
  autocomplete = 'off',
  className,
  text
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
        <p className="text-sm align-middle">{text}</p>
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