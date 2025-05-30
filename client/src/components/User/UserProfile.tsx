import { useParams } from "react-router-dom"
import { useGetApi } from "../../hooks/useGetApi";
import type { UserProfileResponse } from "../../types/profile";
import { Spinner } from "../Spinner";

export const UserProfile = () => {
  const username = useParams().username;

  const { data, error, loading } = useGetApi<UserProfileResponse>(`/api/users/${username}/profile`);

  const profile = data && data.profile;

  if (loading) {
    return <Spinner />
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-between bg-[#fef8f2] w-full">
      {error && (
        <p>{error}</p>
      )}
      {profile && (
        <div className="flex flex-col justify-center gap-5 h-full w-full text-center text-4xl">
          <p>{profile.username}</p>
          <p>{profile.numberOfGigsCompleted}</p>
          <p>{profile.numberOfGigsPosted}</p>
        </div>
      )}
    </div>
  )
}