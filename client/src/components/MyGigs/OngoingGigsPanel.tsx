import { memo, useEffect, useMemo } from "react";
import { useGetApi } from "../../hooks/useGetApi";
import { Card } from "../Card";
import { Spinner } from "../Spinner";
import type { GigPanelProps, OngoingGigPanelProps } from "../../types/mygigs";
import type { GetAcceptedGigsResponse } from "../../types/api";

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
        : <div className="col-span-full text-center text-gray-400">No Applications Found</div>
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
        <div className="w-full overflow-y-auto flex-1 mt-1 sm:mt-5 scrollbar-minimal px-10 sm:px-2">
          <div className="grid sm:grid-cols-[repeat(auto-fit,minmax(375px,400px))] justify-center gap-x-8 gap-y-5">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}


export default OngoingGigsPanel;