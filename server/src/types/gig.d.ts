export type CreateGigInDatabaseInput = {
  imgKey: string;
  title: string;
  price: number;
  description: string;
  authorId: number;
  category?: string;
}

export type GetGigsFromDatabaseInput = {
  category?: string | undefined;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number
}