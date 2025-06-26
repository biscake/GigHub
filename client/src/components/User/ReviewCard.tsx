import type React from "react";
import type { Review } from "../../types/profile";
import { Link } from "react-router-dom";

const ReviewCard: React.FC<Review> = ({ comment, rating, createdAt, reviewer }) => {
  const date = new Date(createdAt);
  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm mb-4">
      <div className="flex flex-col gap-2 text-sm text-black">
        <h2 className="text-lg font-semibold text-main">
          Review by{" "}
          <Link 
            to={`/${reviewer.username}/profile`}
            className="hover:underline"
          >
            {reviewer.username}
          </Link>
        </h2>
        <p className="text-yellow-600 font-medium">{`Rating: ${rating}/5`}</p>
        <p className="text-gray-800">{comment}</p>
        <p className="text-xs text-gray-500">{date.toLocaleString()}</p>
      </div>
    </div>
  );
}

export default ReviewCard;