import type { Area } from "react-easy-crop";
import type { UseFormRegister } from "react-hook-form";

export type Profile = {
  id: number;
  numberOfGigsPosted: number;
  numberOfGigsCompleted: number;
  averageRating: number;
  bio: string | undefined;
  profilePictureKey: string | undefined;
  username: string;
}

export type UserProfileResponse = {
  profile: Profile;
}

export type ProfileCardProp = {
  profile: Profile;
  setIsEdit: (x: boolean) => void;
}

export type ProfileImageProp = {
  profilePictureKey: string | undefined;
  username: string;
}

export type EditProfileData = {
  bio: string | undefined;
  profileName: string;
  file: Buffer;
}

export type UploadProfileProps = React.InputHTMLAttributes<HTMLInputElement> & {
  register: UseFormRegister<EditProfileData>;
  name: keyof EditProfileData;
  image: string | null;
  setImage: React.Dispatch<React.SetStateAction<string | null>>;
  setCroppedImagePixels: React.Dispatch<React.SetStateAction<Area | null>>;
}