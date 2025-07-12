import type { ApplicationStats, GigApplication } from "./application";
import type { User } from "./auth";
import type { Participant, StoredMessage } from "./chat";
import type { PublicKey } from "./crypto";
import type { Gig } from "./gig";
import type { Profile } from "./profile";

export type ApiInterceptorParams = {
  accessToken: string | null;
  setAccessToken: React.Dispatch<React.SetStateAction<string | null>>;
  logout: () => void;
}

export type ValidationError = {
  msg: string;
}

export interface ApiResponse {
  message: string;
  success: boolean;
}

export interface PostRefreshTokenResponse extends ApiResponse {
  accessToken: string;
}

export interface ApiErrorResponse extends ApiResponse {
  errors?: ValidationError[]; 
}

export interface GetConversationParticipantsResponse extends ApiResponse {
  participants: Participant[];
  conversationKey: string;
}

export interface GetPublicKeysResponse extends ApiResponse {
  publicKeys: PublicKey[];
}

export interface ApplicationStatsResponse extends ApiResponse {
  stats: ApplicationStats;
}

export interface GetApplicationResponse extends ApiResponse {
  applications: GigApplication[];
  pageSize: number;
  page: number;
  totalPages: number;
  total: number;
}

export interface GetGigsResponse extends ApiResponse {
  gigs: Gig[];
  totalPages: number;
}

export interface UserProfileResponse extends ApiResponse {
  profile: Profile;
}

export interface PostLoginResponse extends ApiResponse {
  user: User;
  accessToken: string;
}

export interface GetChatMessagesResponse extends ApiResponse {
  chatMessages: StoredMessage[];
}

export interface GetReadReceiptResponse extends ApiResponse {
  lastReads: {
    userId: number;
    lastRead: string;
  }[];
  conversationKey: string;
}

export interface GetUsernameByUserIdResponse extends ApiResponse {
  username: string;
}

export interface GetAllConversationKeysResponse extends ApiResponse {
  conversations: {
    conversationKey: string;
    participants: string[];
    title: string;
  }[];
}

export interface GetAllLastReadResponse extends ApiResponse {
  lastReads: {
    userId: number;
    conversationKey: string;
    lastRead: string;
  }[];
}

export interface GetSearchUserResponse extends ApiResponse {
  users: {
    username: string;
    userId: number;
    profilePictureUrl: string;
    bio: string | null;
  }[];
}

export interface GetAcceptedGigsResponse extends ApiResponse {
  gigs: Gig[];
  totalPages: number;
}

export interface GetGigConversationResponse extends ApiResponse {
  conversationKey: string;
  title: string;
  participants: string[];
}

export interface GetConversationMetaResponse extends ApiResponse {
  conversationKey: string;
  title: string;
  participants: string[];
}

export interface GetPostedGigsResponse extends ApiResponse {
  gigs: GigWithApplications[];
  totalPages: number;
}

type GigWithApplications = Gig & {
  applications: GigApplication[];
};