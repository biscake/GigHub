import type { ApplicationStats, GigApplication } from "./application";
import type { User } from "./auth";
import type { StoredMessage } from "./chat";
import type { Gig } from "./gig";
import type { PublicKey } from "./key";
import type { Profile } from "./profile";

export type ValidationError = {
  msg: string;
}

export interface ApiResponse {
  message: string;
  success: boolean;
}

export interface ApiErrorResponse extends ApiResponse {
  errors?: ValidationError[]; 
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

export interface GigsResponse extends ApiResponse {
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
  updatedReadReceipts: {
    messageId: string;
    readAt: string;
  }[];
  lastUpdatedISOString: string;
}