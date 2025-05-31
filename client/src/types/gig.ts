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
  imgUrl: string | undefined;
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
  onClick: (x: Gig) => void;
}

export type GigModalProp = {
  gig: Gig | null;
  setSelectedGig: React.Dispatch<React.SetStateAction<Gig | null>>;
}

export type ApplyGigFormData = {
  message?: string;
}

export type GigCardProp = Gig & {
  onClick: () => void;
}