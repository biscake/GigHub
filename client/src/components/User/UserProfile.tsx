import { useParams } from "react-router-dom"
import { useGetApi } from "../../hooks/useGetApi";
import type { UserProfileResponse } from "../../types/profile";
import { Spinner } from "../Spinner";
import ProfileCard from "./ProfileCard";
import { useState } from "react";
import EditProfileForm from "./EditProfileForm";

const UserProfile = () => {
  const username = useParams().username;

  const [isEdit, setIsEdit] = useState<boolean>(false);

  const { data, error, loading } = useGetApi<UserProfileResponse>(`/api/users/${username}/profile`)

  if (!data) {
    return <>{error && <p>{error}</p>}</>
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-between bg-[#fef8f2] w-full p-5">
      {isEdit ? <EditProfileForm profile={data.profile} setIsEdit={setIsEdit} />
              : <ProfileCard profile={data.profile} setIsEdit={setIsEdit} /> }
      
    </div>
  )
}

export default UserProfile;