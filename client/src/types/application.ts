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
}

export type SentApplicationResponse = {
  applications: GigApplication[];
}
