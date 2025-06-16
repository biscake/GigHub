import type React from "react"
import type { GetGigAuthorResponse, GigCardProp } from "../types/gig"
import { GigImage } from "./GigImage"
import { useGetApi } from "../hooks/useGetApi"
import { NavLink } from "react-router-dom"


export const Card : React.FC<GigCardProp> = ({ authorId, imgUrl, title, price, description, onClick }) => {
  const { data } = useGetApi<GetGigAuthorResponse>(`/api/users/${ authorId }`);

  return (
    <div onClick={onClick} className="bg-[#fefefd] w-full max-w-md h-auto border border-white/50 rounded-2xl p-4 mb-2 shadow cursor-pointer">
      <GigImage imgUrl={ imgUrl } />
      <h2 className="text-lg font-bold">{ title }</h2>
      <p className="text-sm md:text-base">{ description }</p>
      <NavLink
        to={`/${ data?.username }/profile`}
        className="hover:underline text-lg"
      >
        By: { data?.username }
      </NavLink>
      <p>${ price }</p>
      {/* <p>{ category }</p> */}
    </div>
  )
}