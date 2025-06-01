import { useFormContext, type FieldError } from 'react-hook-form';
import type { TextAreaProps } from "../../types/inputProps";

export const Textarea: React.FC<TextAreaProps> = (props) => {
  const { register, formState: { errors } } = useFormContext();

  const inputError = errors[props.name] as FieldError | undefined;

  return (
    <>
      <textarea
        {...props}
        {...register(props.name, props.validation)}
        className="block mt-2 w-full placeholder-gray-400/70 rounded-lg border border-gray-200 bg-white 
        px-4 h-32 py-2.5 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 resize-none"> 
      </textarea>
      {inputError?.message &&
        <span className="ml-2 px-2 py-1 bg-red-200 text-rose-400 text-xs whitespace-nowrap rounded absolute left-full top-1/2 -translate-y-1/2">
          {inputError?.message}
        </span>}
    </>  
  )
}