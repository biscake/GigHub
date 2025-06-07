import type { ReactNode, SetStateAction } from "react";
import type { User } from "./auth";
import type { Gig } from "./gig";

export type ApplicationStats = {
  received: number;
  sent: number;
}

export type ApplicationStatsResponse = {
  stats: ApplicationStats;
}

export type GigApplication = {
  id: number;
  createdAt: Date;
  user: User;
  status: Status;
  gig: Gig;
  message?: string;
}

type Status = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export type ApplicationListItemProps = {
  application: GigApplication;
  key: number;
  handleAccept?: () => void;
  handleReject?: () => void;
  handleEditMessage?: (message: string) => void;
  handleViewGig?: () => void;
  handleCancelApplication?: () => void;
}

export type GetApplicationResponse = {
  applications: GigApplication[];
  pageSize: number;
  page: number;
  totalPages: number;
  total: number;
}

export type ApplicationPanelProps = {
  children: ReactNode;
  title: string;
  loading: boolean;
  error: string | null;
}

export type AppTabProps = {
  children: ReactNode;
  className?: string;
  setPage: React.Dispatch<SetStateAction<number>>;
}

export type ReceivedApplicationsPanelProps = {
  page: number;
  setTotalPages: React.Dispatch<SetStateAction<number>>;
}

export type SentApplicationsPanelProps = {
  page: number;
  setTotalPages: React.Dispatch<SetStateAction<number>>;
}

export type EditApplicationFormInput = {
  message: string;
}