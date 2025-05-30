import type { DashboardGigsProps } from "../../types/gig";
import { Card } from "../Card";
import { Spinner } from "../Spinner";

const DashboardGigs: React.FC<DashboardGigsProps> = ({ gigs, loading, error }) => {
  if (loading) {
    return <Spinner />
  }

  if (error) {
    return (
      <p className="text-s text-rose-400">
        {error}
      </p>
    )
  }

  if (!gigs) {
    return (
      <div className="col-span-full text-center text-gray-400">
        <p>No gigs found</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-y-auto flex-1 mt-1 sm:mt-5 scrollbar-minimal px-10 sm:px-2">
      <div className="grid sm:grid-cols-[repeat(auto-fit,minmax(375px,400px))] justify-center gap-x-8 gap-y-5">
        {gigs.length > 0 ? (
          gigs.map(gig => <Card key={gig.id} {...gig} />)
        ) : (
          <div className="col-span-full text-center text-gray-400">
            <p>No gigs found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardGigs;