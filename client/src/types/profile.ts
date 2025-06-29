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

export type ProfileCardProp = {
  profile: Profile;
  setIsEdit: (x: boolean) => void;
  refetch: () => void;
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

export type UserReviewProps = {
  username: string;
}

type Reviewer = {
  id: number;
  username: string;
}

export type Review = {
  id: number;
  comment: string;
  rating: number;
  createdAt: string;
  reviewer: Reviewer;
};

export type UserWithReviewsResponse = {
  id: number;
  username: string;
  receivedReviews: Review[];
};

export type UserIdResponse = {
  userId: number;
}

export type ReviewUserData = {
  comment: string;
  rating: number;
}

export type CreateReviewFormProps = {
  setIsReview: React.Dispatch<React.SetStateAction<boolean>>;
}
