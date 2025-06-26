import { memo, useEffect, useMemo } from "react";
import { useGetApi } from "../../hooks/useGetApi";
import type { GetAcceptedGigsResponse } from "../../types/api";
import { Card } from "../Card";
import { Spinner } from "../Spinner";
import type { GigPanelProps, OngoingGigPanelProps } from "../../types/mygigs";

const OngoingGigsPanel: React.FC<OngoingGigPanelProps> = memo(({ page, setTotalPages, setSelectedGig }) => {
  const opts = useMemo(() => ({
    params: {
      page
    }
  }), [page]);

  const { data, loading, error } = useGetApi<GetAcceptedGigsResponse>('/api/gigs/applications/accepted', opts);

  useEffect(() => {
    if (!data) return;
    setTotalPages(data.totalPages);
  }, [setTotalPages, data]);

  return (
    <GigPanel title="Ongoing" error={error} loading={loading}>
      {data && data.gigs && data.gigs.length > 0
        ? data.gigs.map((gig, i) =>
          <Card key={i} {...gig} onClick={() => setSelectedGig(gig)}/>
        )
        : <span>No Applications Found</span>
      }
    </GigPanel>
  )
})

const GigPanel = ({ children, title, loading, error }: GigPanelProps) => {
  if (error) {
    return (
      <p className="text-s text-rose-400 self-center my-auto">
        {error}
      </p>
    )
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <>
      <div className="flex-1 w-full px-8">
        <div className="font-bold text-xl sm:text-3xl w-full p-4 pl-0 pt-0">{title}</div>
        <ul className="flex flex-col gap-3">
          {children}
        </ul>
      </div>
    </>
  )
}


export default OngoingGigsPanel;