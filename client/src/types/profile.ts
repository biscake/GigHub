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
  profile: Profile | null;
}

export type ProfileImageProp = {
  profilePictureKey: string | undefined;
  username: string;
}