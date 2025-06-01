import type React from "react"
import type { GigCardProp } from "../types/gig"
import { GigImage } from "./GigImage"

export const Card : React.FC<GigCardProp> = ({ imgUrl, title, price, description, onClick }) => {
  return (
    <div onClick={onClick} className="bg-[#fefefd] w-full max-w-md h-auto border border-white/50 rounded-2xl p-4 mb-2 shadow">
      <GigImage imgUrl={ imgUrl } />
      <h2 className="text-lg font-bold">{ title }</h2>
      {/* Link component to wrap whole card */}
      <p className="text-sm md:text-base">{ description }</p>
      <p>${ price }</p>
      {/* <p>{ author }</p>
      <p>{ category }</p> */}
    </div>
  )
}