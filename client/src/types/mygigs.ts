import type { GigApplication } from "./application";
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

export interface PostedGigPanelProps {
  page: number;
  setTotalPages: React.Dispatch<React.SetStateAction<number>>;
  setSelectedGig: React.Dispatch<React.SetStateAction<Gig | null>>;
  setApplications: React.Dispatch<React.SetStateAction<GigApplication[] | null>>;
}

export interface PostedGigsModalProps {
  gig: Gig | null;
  setSelectedGig: React.Dispatch<React.SetStateAction<Gig | null>>;
  setApplications: React.Dispatch<React.SetStateAction<GigApplication[] | null>>;
  applications: GigApplication[] | null;
}

export interface ApplicationListItemProps {
  username: string;
  onClick: () => void;
}

export interface PostedGigsDropdownMenuProps {
  gig: Gig;
  refetch: () => void;
}

export interface ConfirmDeleteGigModalProps {
  handleDelete: () => Promise<void>;
  showWarning: boolean;
  handleClose: () => void;
  errorMessage?: string;
}