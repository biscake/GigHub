import type { ReactNode } from "react";
import { useGetApi } from "../../hooks/useGetApi";
import type { ApplicationStatsResponse } from "../../types/application";

const GigApplicationStats = ({ className = "" }: { className?: string; }) => {
  const { data } = useGetApi<ApplicationStatsResponse>('/api/gigs/applications/stats');

  return (
    <div className={`flex flex-row justify-center sm:justify-start w-full gap-5 ${className}`}>
      <ApplicationCount count={data?.stats.received}>
        Incoming:
      </ApplicationCount>
      <ApplicationCount count={data?.stats.sent}>
        Outgoing:
      </ApplicationCount>
    </div>
  )
}

const ApplicationCount = ({ children, count }: { children: ReactNode; count?: number}) => {
  return (
    <div className="flex justify-center items-center text-md sm:text-xl">
      {children}
      <span>&nbsp;{count ?? "--"}</span>
    </div>
  )
}

export default GigApplicationStats;