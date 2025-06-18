import type React from "react";
import type { UserReviewProps, UserWithReviewsResponse } from "../../types/profile";
import { useGetApi } from "../../hooks/useGetApi";
import { Spinner } from "../Spinner";
import ReviewCard from "./ReviewCard";

const UserReview: React.FC<UserReviewProps> = ({ username }) => {
  const { data, error, loading } = useGetApi<UserWithReviewsResponse>(`/api/users/${username}/reviews`)

  if (!data) {
    return <>{error && <p>{error}</p>}</>
  }

  const reviews = data.receivedReviews;

  if (loading) {
    return <Spinner />
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-between w-full p-5">
      <h3 className="text-2xl">Reviews: </h3>
      {reviews.map(review => <ReviewCard {...review} />)}
    </div>
  )
}

export default UserReview;