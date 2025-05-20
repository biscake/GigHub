import type { CheckBoxProp } from "../types/inputProps"

export const Checkbox = (props: CheckBoxProp) => {
  return (
    <div className="flex flex-row">
      <input type="checkbox" {...props} />
      <span className="text-sm align-middle">{props.text}</span>
    </div>
  )
}