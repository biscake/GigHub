import { Gig } from "@prisma/client";

export interface CreateGigInDatabaseParams {
  imgKey: string;
  title: string;
  price: number;
  description: string;
  authorId: number;
  category?: string;
}

export interface DeleteGigFromDatabaseParams {
  id: number;
}

export interface GetGigsFromDatabaseParams {
  category?: string | undefined;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  NUMBER_OF_GIGS: number;
}

export interface GetGigFromDatabaseByIdParams {
  id: number;
}

export interface AcceptGigByIdParams {
  gig: Gig;
  userId: number;
  message?: string;
}

export interface UpdateApplicationStatusByIdParams {
  applicationId: number;
}

export interface UpdateCompletedByIdParams {
  applicationId: number;
}