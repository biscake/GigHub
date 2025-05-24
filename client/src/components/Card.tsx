import type React from "react"
import type { Gig } from "../types/gig"
import { GigImage } from "./GigImage"

export const Card : React.FC<Gig> = ({ imgUrl, title, price, description, author, category }) => {
  return (
    <div className="w-full max-w-md h-auto border border-gray-400 rounded-2xl p-4 mb-2 shadow">
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