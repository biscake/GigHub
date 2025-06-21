import type { ProfileCardProp } from "../../types/profile";
import ProfileImage from "./ProfileImage";

const ProfileCard: React.FC<ProfileCardProp> = ({ profile, setIsEdit }) => {
  return (
    <>
      {profile && (
        <div className="w-full flex flex-col items-center">
          <div className="w-full flex flex-row justify-between item-center p-5">
            <ProfileImage profilePictureKey={profile.profilePictureKey} username={profile.username} />
            <div className="flex flex-col items-center justify-center">
              <button
                onClick={() => setIsEdit(true)}
                className="w-full justify-center rounded-md bg-green-600 px-3 p-2 text-xl font-semibold text-white shadow-xs hover:bg-green-500 sm:w-auto cursor-pointer"
              >
                edit
              </button>
            </div>
          </div>
          <div className="w-full text-2xl px-10 py-5 rounded-xl border-[0.5px] border-gray-200 shadow-xs">
            <p>Bio: </p>
            <p>{profile.bio}</p>
          </div>

        </div>
      )}
    </>
  )
}

export default ProfileCard;