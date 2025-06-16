export interface getUserWithNormalizedProfileByUsernameParams {
  username: string;
}

export interface GetUserWithReviewsByUsernameParams {
  username: string;
  NUMBER_OF_REVIEWS: number;
}

export interface updateUserByProfileParams {
  profileName: string;
  bio: string | null;
  profilePictureKey: string;
}