import type { ButtonHTMLAttributes } from "react";

const ApplicationListButton: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  return (
    <button {...props} className={`${props.className} text-[#fef9f1] rounded-xl flex cursor-pointer px-5 py-2`}>{props.children}</button>
  )
}

export default ApplicationListButton;