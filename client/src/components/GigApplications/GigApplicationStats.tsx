import type { ReactNode } from "react";
import { useGetApi } from "../../hooks/useGetApi";
import type { ApplicationStatsResponse } from "../../types/application";

const GigApplicationStats = ({ className = "" }: { className?: string; }) => {
  const { data } = useGetApi<ApplicationStatsResponse>('/api/gigs/applications/stats');

  return (
    <div className={`flex flex-row w-full font-mono font-bold ${className}`}>
      <ApplicationCount count={data?.stats.received}>
        Received Applications:
      </ApplicationCount>
      <ApplicationCount count={data?.stats.sent}>
        Sent Applications:
      </ApplicationCount>
    </div>
  )
}

const ApplicationCount = ({ children, count }: { children: ReactNode; count?: number}) => {
  return (
    <div className="w-1/2 flex justify-center items-center text-white text-[1.5rem]">
      {children}
      <span>&nbsp;{count ?? "--"}</span>
    </div>
  )
}

export default GigApplicationStats;