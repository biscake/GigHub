import type { InputProps } from "../../types/inputProps";
import { Input } from "../Input";

export const FormInput = (props: InputProps) => {
  return (
    <Input {...props}  className="w-full border border-gray-300 rounded-3xl px-4 py-2 focus:outline-none" />
  )
}