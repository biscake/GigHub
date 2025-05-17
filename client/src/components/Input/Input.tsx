import { useFormContext, type FieldError, type RegisterOptions } from 'react-hook-form';

type InputProps = {
  type: string;
  id: string;
  placeholder?: string;
  name: string;
  validation?: RegisterOptions;
  autocomplete?: string;
};

//TODO: add styling
export const Input : React.FC<InputProps> = ({ 
  type, 
  id, 
  placeholder, 
  name, 
  validation, 
  autocomplete = 'off' 
}) => {
  const { register, formState: { errors } } = useFormContext();

  const inputError = errors[name] as FieldError | undefined;

  return (
    <div>
      {inputError?.message && <InputError message={inputError.message} />}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...register(name, validation)}
        autoComplete={autocomplete}
      />
    </div>
  )
}

type InputErrorProps = {
  message?: string;
}

const InputError : React.FC<InputErrorProps> = ({ message }) => {
  return (
    <span style={{color: 'red'}}>{message}</span>
  )
}