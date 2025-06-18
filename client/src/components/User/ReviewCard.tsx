import type React from "react";
import type { Review } from "../../types/profile";

const ReviewCard: React.FC<Review> = ({ comment, rating, createdAt, reviewer }) => {
  return (
    <div className="w-full max-w-md h-auto border border-white/50 rounded-2xl p-4 mb-2 shadow cursor-pointer">
      <h2 className="text-lg font-bold">{`review by ${reviewer.username}`}</h2>
      <p>rating: {rating}</p>
      <p className="text-sm md:text-base">{comment}</p>
      <p>{createdAt}</p>
    </div>
  )
}

export default ReviewCard;