import { memo, useEffect, useMemo } from "react";
import { useGetApi } from "../../hooks/useGetApi";
import type { GetPostedGigsResponse } from "../../types/api";
import { Card } from "../Card";
import { Spinner } from "../Spinner";
import type { GigPanelProps, PostedGigPanelProps } from "../../types/mygigs";
import type { Gig } from "../../types/gig";
import type { GigApplication } from "../../types/application";

const PostedGigPanel: React.FC<PostedGigPanelProps> = memo(({ page, setTotalPages, setSelectedGig, setApplications }) => {
  const opts = useMemo(() => ({
    params: {
      page
    }
  }), [page]);

  const { data, loading, error } = useGetApi<GetPostedGigsResponse>('/api/gigs/posted', opts);

  useEffect(() => {
    if (!data) return;
    setTotalPages(data.totalPages);
  }, [setTotalPages, data]);

  const openModal = (gig: Gig, applications: GigApplication[]) => {
    setSelectedGig(gig);
    setApplications(applications);
  }

  return (
    <GigPanel title="Ongoing" error={error} loading={loading}>
      {data && data.gigs && data.gigs.length > 0
        ? data.gigs.map((gig, i) =>
          <Card key={i} {...gig} onClick={() => openModal(gig, gig.applications)}/>
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


export default PostedGigPanel;