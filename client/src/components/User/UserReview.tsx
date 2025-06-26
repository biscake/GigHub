import type React from "react";
import type { UserReviewProps, UserWithReviewsResponse } from "../../types/profile";
import { useGetApi } from "../../hooks/useGetApi";
import { Spinner } from "../Spinner";
import ReviewCard from "./ReviewCard";
import { useState } from "react";
import CreateReviewForm from "./CreateReviewForm";
import { useAuth } from "../../hooks/useAuth";

const UserReview: React.FC<UserReviewProps> = ({ username }) => {
  const { data, error, loading } = useGetApi<UserWithReviewsResponse>(`/api/users/${username}/reviews`)
  const [isReview, setIsReview] = useState<boolean>(false);

  const { user } = useAuth();

  if (!data) {
    return <>{error && <p>{error}</p>}</>
  }

  const reviews = data.receivedReviews;

  if (loading) {
    return <Spinner />
  }

  const editButton = "w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-xs sm:ml-3 sm:w-auto" 
    + (user ? " bg-green-600 text-white hover:bg-green-500 cursor-pointer" 
            : " bg-gray-300 text-gray-500 cursor-not-allowed");

  console.log(editButton)

  return (
    <>
      {isReview ? (
        <CreateReviewForm setIsReview={setIsReview} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-between w-full p-5">
          <div className="w-full flex flex-row justify-between gap-2 p-5">
            <h3 className="text-2xl">Reviews: </h3>
            <button
              onClick={() => setIsReview(true)}
              disabled={!user}
              className={editButton}
            >Review {username}</button>
          </div>
          <div className="w-full flex flex-col overflow-x-auto flex-shrink-0">
            {reviews.map(review => <ReviewCard {...review} />)}
          </div>
        </div>)
      }
    </>
  )
}

export default UserReview;