import type React from "react";
import type { ProfileImageProp } from "../../types/profile";

const ProfileImage: React.FC<ProfileImageProp> = ({ profilePictureKey, username }) => {
  const img = profilePictureKey ? profilePictureKey : "/Default_pfp.svg"
  
  return (
    <div className="w-full flex flex-row justify-start items-center gap-5">
      <img
        src={img}
        className="w-[8vw] h-auto aspect-[1/1] overflow-hidden rounded-full object-cover shadow-xs text-center"
      />
      <p className="text-4xl font-bold">
        {username}
      </p>
    </div>
  )
}

export default ProfileImage;