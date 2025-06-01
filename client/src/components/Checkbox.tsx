import { useFormContext } from "react-hook-form";
import type { CheckBoxProp } from "../types/inputProps";

export const Checkbox = ({ name, text, ...rest }: CheckBoxProp) => {
  const { register } = useFormContext();

  return (
    <label className="flex flex-row items-center space-x-2">
      <input type="checkbox" {...register(name)} {...rest} />
      <span>{text}</span>
    </label>
  );
};