import type { TextAreaProps } from "../../types/inputProps"

export const Textarea: React.FC<TextAreaProps> = (props) => {
  return (
    <div>
      <textarea {...props} {...props.register("description")} placeholder="Give a short description of your gig"
        className="block mt-2 w-full placeholder-gray-400/70 rounded-lg border border-gray-200 bg-white 
        px-4 h-32 py-2.5 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 resize-none"> 
      </textarea>
    </div>  
  )
}