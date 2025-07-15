import type { GigImageProp } from "../types/gig"

export const GigImage: React.FC<GigImageProp> = ({ imgUrl, className }) => {
  return (
    <div className={`w-full aspect-[4/3] overflow-hidden flex flex-row items-center justify-center ${className}`}>
      <img 
        src={ imgUrl } 
        className="rounded-2xl max-w-full h-auto object-cover object-center"
      />
    </div>
  )
}