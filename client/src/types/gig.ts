export type Gig = {
  id: number;
  imgUrl: string;
  title: string;
  price: number;
  description: string;
  authorId: number;
  category: string | undefined;
  totalPages?: number;
}

export type GigImageProp = {
  imgUrl: string | undefined;
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
  isViewMode?: boolean;
}

export type ApplyGigModalProp = {
  gig: Gig | null;
  applyModal: boolean;
  setApplyModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export type ApplyGigFormData = {
  message?: string;
}

export type GigCardProp = Gig & {
  onClick: () => void;
}

export type CreateGigSidebarButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}

export type GetGigAuthorResponse = {
  username: string;
}
