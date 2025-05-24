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
          {...(props.className 
            ? { className: props.className } 
            : { className: "autofill:shadow-[inset_0_0_0px_1000px_rgb(255,209,220)] w-full border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40"})}
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
