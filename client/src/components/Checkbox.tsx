import type { CheckBoxProp } from "../types/inputProps"

export const Checkbox = (props: CheckBoxProp) => {
  return (
    <label className="flex flex-row">
      <input type="checkbox" {...props} />
      {props.text}
    </label>
  )
}