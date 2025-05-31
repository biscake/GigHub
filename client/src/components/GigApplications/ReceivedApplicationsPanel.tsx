import { memo, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useGetApi } from "../../hooks/useGetApi";
import type { ApplicationListItemProps, GetApplicationResponse, ReceivedApplicationsPanelProps } from "../../types/application";
import { timeAgo } from "../../utils/timeAgo";
import ApplicationDisclosureContainer from "./ApplicationDisclosureContainer";
import ApplicationListButton from "./ApplicationListButton";
import ApplicationListContent from "./ApplicationListContent";
import ApplicationPanel from "./ApplicationPanel";

const ReceivedApplicationsPanel: React.FC<ReceivedApplicationsPanelProps> = memo(({ page, setTotalPages }) => {
  const opts = useMemo(() => ({
    params: {
      page
    }
  }), [page]);

  const { data, loading, error } = useGetApi<GetApplicationResponse>('/api/gigs/applications/received', opts);

  useEffect(() => {
    if (!data) return;
    setTotalPages(data.totalPages);
  }, [setTotalPages, data]);

  return (
    <ApplicationPanel title="Received" error={error} loading={loading}>
      {data && data.applications && data.applications.length > 0
        ? data.applications.map((app, i) => <ApplicationListItem key={i} application={app} />)
        : <span>No Applications Found</span>
      }
    </ApplicationPanel>
  )
})

const ApplicationListItem: React.FC<ApplicationListItemProps> = ({ application }) => {
  return (
    <li>
      <ApplicationDisclosureContainer title={application.gig.title}>
        <ApplicationListContent title="Message">
          {application.message}
        </ApplicationListContent>
        <ApplicationListContent title="Applicant">
          <Link to={`/${application.user.username}`}>
            {application.user.username}
          </Link>
        </ApplicationListContent>
        <span>Applied {timeAgo(application.createdAt)}</span>
        <div className="flex items-center">
          <div className="ml-auto flex gap-3">
            <ApplicationListButton className="bg-[#dac8c0]">Decline</ApplicationListButton>
            <ApplicationListButton className="bg-[#b38b82]">Accept</ApplicationListButton>
          </div>
        </div>
      </ApplicationDisclosureContainer>
    </li>
  )
}

export default ReceivedApplicationsPanel;