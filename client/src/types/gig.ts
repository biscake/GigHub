export type Gig = {
  id: number;
  imgUrl: string;
  title: string;
  price: number;
  description: string;
  author: string;
  category: string | undefined;
  totalPages: number;
}

export type GigImageProp = {
  imgUrl: string;
}

export type GigsResponse = {
  gigs: Gig[];
  totalPages: number;
}