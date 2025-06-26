import { useParams } from "react-router-dom"
import { useGetApi } from "../../hooks/useGetApi";
import { Spinner } from "../Spinner";
import ProfileCard from "./ProfileCard";
import { useState } from "react";
import EditProfileForm from "./EditProfileForm";
import UserReview from "./UserReview";
import type { UserProfileResponse } from "../../types/api";

const UserProfile = () => {
  const username = useParams().username;

  const [isEdit, setIsEdit] = useState<boolean>(false);

  if (!username) {
    return <div className="w-full h-full bg-main text-center py-6">User not found.</div>;
  }

  const { data, error, loading } = useGetApi<UserProfileResponse>(`/api/users/${username}/profile`)

  if (!data) {
    return <>{error && <p>{error}</p>}</>
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-between bg-main w-full p-5">
      {isEdit ? <EditProfileForm profile={data.profile} setIsEdit={setIsEdit} />
              : (
                  <div className="w-full">
                    <ProfileCard profile={data.profile} setIsEdit={setIsEdit} />
                    <UserReview username={username} />
                  </div>
                )}
    </div>
  )
}

export default UserProfile;