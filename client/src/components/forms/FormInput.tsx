import { useFormContext, type FieldError } from 'react-hook-form';
import type { InputProps } from "../../types/inputProps";

export const FormInput: React.FC<InputProps> = (props) => {
  const { register, formState: { errors } } = useFormContext();

  const inputError = errors[props.name] as FieldError | undefined;

  return (
    <div className='relative'>
      <label className="flex flex-row">
        <input
          {...props}
          {...(props.className ? { className: props.className } : { className: "w-full border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none"})}
          {...register(props.name, props.validation)}
        />
      </label>
      {inputError?.message &&
        <span className="ml-2 px-2 py-1 bg-red-200 text-rose-400 text-xs whitespace-nowrap rounded absolute left-full top-1/2 -translate-y-1/2">
          {inputError?.message}
        </span>}
    </div>
  )
}
