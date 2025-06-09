import { useParams } from "react-router-dom"
import { useGetApi } from "../../hooks/useGetApi";
import type { UserProfileResponse } from "../../types/profile";
import { Spinner } from "../Spinner";
import ProfileCard from "./ProfileCard";

const UserProfile = () => {
  const username = useParams().username;

  const { data, error, loading } = useGetApi<UserProfileResponse>(`/api/users/${username}/profile`);

  const profile = data && data.profile;

  if (loading) {
    return <Spinner />
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-between bg-[#fef8f2] w-full p-5">
      <ProfileCard profile={profile} />
      {error && <p>{error}</p>}
    </div>
  )
}

export default UserProfile;