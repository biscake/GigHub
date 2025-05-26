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

export type GigCardProp = Gig & {
  onClick: () => void;
}

export type GigModalProp = {
  gig: Gig | null;
  setSelectedGig: React.Dispatch<React.SetStateAction<Gig | null>>;
}

export type ApplyGigFormData = {
  message?: string;
}