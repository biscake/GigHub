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
    <GigPanel title="Posted" error={error} loading={loading}>
      {data && data.gigs && data.gigs.length > 0
        ? data.gigs.map((gig, i) =>
          <Card key={i} {...gig} onClick={() => openModal(gig, gig.applications)}/>
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


export default PostedGigPanel;