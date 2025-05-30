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

export type GigFilters = {
  category: string;
  search: string;
  page: number;
} 

export type DashboardGigsProps = {
  gigs: Gig[] | undefined;
  loading: boolean;
  error: string | null;
}