export interface getUserWithNormalizedProfileByUsernameParams {
  username: string;
}

export interface GetUserWithReviewsByUsernameParams {
  username: string;
  NUMBER_OF_REVIEWS: number;
}

export interface updateUserByProfileParams {
  id: number;
  profileName: string;
  bio: string | null;
  profilePictureKey: string;
}

export interface GetUserByIdParams {
  id: number;
}

export interface GetUserByNameParams {
  username: string;
}

export interface createReviewInDatabaseParams {
  comment: string;
  rating: number;
  reviewerId: number;
  revieweeId: number;
}

export interface GetNormalizedProfilesParams {
  search: string;
}

export interface deleteReviewInDatabaseParams {
  id: number;
}

export interface updateNumberPostedGigByUsernameParams {
  id: number;
  value: number;
}

export interface updateNumberCompletedByGigApplicationIdParams {
  applicationId: number;
}