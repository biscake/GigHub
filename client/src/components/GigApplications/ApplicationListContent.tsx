import type { HTMLAttributes } from "react";

const ApplicationListContent: React.FC<HTMLAttributes<HTMLDivElement>> = ({ title, children, className }) => {
  return (
    <div className={`${className} text-base sm:text-lg font-medium`}>{title}{": "}
      <span className="font-normal">{children}</span>
    </div>
  )
}

export default ApplicationListContent;