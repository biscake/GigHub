import type { GigImageProp } from "../types/gig"

export const GigImage = ({ imgUrl } : GigImageProp) => {
  return (
    <div className="h-[35vh] overflow-hidden flex flex-row items-center justify-center">
      <img 
        src={ imgUrl } 
        className="max-w-full h-auto object-cover object-center"
      />
    </div>
  )
}