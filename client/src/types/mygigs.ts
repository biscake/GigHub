import type { Gig } from "./gig";

export interface GigPanelProps {
  children: React.ReactNode;
  title: string;
  loading: boolean;
  error: string | null;
}

export interface OngoingGigPanelProps {
  page: number;
  setTotalPages: React.Dispatch<React.SetStateAction<number>>;
  setSelectedGig: React.Dispatch<React.SetStateAction<Gig | null>>;
}

export interface OngoingGigModalProps {
  gig: Gig | null;
  setSelectedGig: React.Dispatch<React.SetStateAction<Gig | null>>;
}