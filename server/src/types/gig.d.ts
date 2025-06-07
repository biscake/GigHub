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
  gigId: number;
  userId: number;
  message?: string;
}

export interface createGigApplicationByIdParams {
  gigId: number;
  userId: number;
  message?: string;
  gigAuthorId: number;
}

export interface UpdateApplicationStatusByIdParams {
  applicationId: number;
}