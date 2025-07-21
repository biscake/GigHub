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

  const { data, error, loading, refetch } = useGetApi<UserProfileResponse>(`/api/users/${username}/profile`)

  if (!data) {
    return <>{error && <p>{error}</p>}</>
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-between bg-main w-full p-5">
      {isEdit ? <div className="flex flex-col items-center justify-start w-full">
                  <div className="flex flex-row items-center justify-start w-full gap-5">
                    <button className="rounded-md p-2 font-semibold shadow-xs hover:bg-gray-200 sm:ml-3 sm:w-auto cursor-pointer" onClick={() => setIsEdit(false)}>back</button>
                    <h1 className="text-xl font-bold">Edit Profile</h1>
                  </div>
                  <EditProfileForm profile={data.profile} setIsEdit={setIsEdit} refetch={refetch} />
                </div>
              : (
                  <div className="w-full">
                    <ProfileCard profile={data.profile} setIsEdit={setIsEdit} refetch={refetch} />
                    <UserReview username={username} />
                  </div>
                )}
    </div>
  )
}

export default UserProfile;