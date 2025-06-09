import type { ProfileCardProp } from "../../types/profile";
import ProfileImage from "./ProfileImage";
import { NavLink } from "react-router-dom";

const ProfileCard: React.FC<ProfileCardProp> = ({ profile }) => {
  return (
    <>
      {profile && (
        <div className="w-full flex flex-col">
          <div className="w-full flex flex-row justify-between item-center p-5">
            <ProfileImage profilePictureKey={profile.profilePictureKey} username={profile.username} />
            <div className="flex flex-col items-center justify-center">
              <NavLink
                to={`/${profile.username}/edit`}
                className="w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-500 sm:ml-3 sm:w-auto cursor-pointer"
              >
                edit
              </NavLink>
            </div>
          </div>
          <div className="text-3xl">
            <p>Bio: </p>
            <p>{profile.bio}</p>
          </div>

        </div>
      )}
    </>
  )
}

export default ProfileCard;