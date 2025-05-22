import type React from "react"
import type { Gig } from "../types/gig"

export const Card : React.FC<Gig> = ({ id, imgUrl, title, price, description, author, category }) => {
  return (
    <div key={id} className="border border-gray-400 rounded-lg p-4 mb-2">
      {/* Custom image component */}
      <img src={ imgUrl }></img>
      <h2 className="font-bold">{ title }</h2>
      {/* Custom Link component to wrap whole card */}
      <p>{ description }</p>
      <p>${ price }</p>
      <p>{ author }</p>
      <p>{ category }</p>
    </div>
  )
}