import { useGetApi } from "../../hooks/useGetApi";
import type { ApplicationListItemProps, SentApplicationResponse } from "../../types/application";
import { timeAgo } from "../../utils/timeAgo";
import ApplicationListButton from "./ApplicationListButton";
import ApplicationListContent from "./ApplicationListContent";
import { Link } from "react-router-dom";
import ApplicationDisclosureContainer from "./ApplicationDisclosureContainer";
import ApplicationPanel from "./ApplicationPanel";

const ReceivedApplicationsPanel = () => {
  const { data, loading, error } = useGetApi<SentApplicationResponse>('/api/gigs/applications/received');

  return (
    <ApplicationPanel title="Received" error={error} loading={loading}>
      {data && data?.applications.length > 0
        ? data.applications.map((app, i) => <ApplicationListItem key={i} application={app} />)
        : <span>No Applications Found</span>
      }
    </ApplicationPanel>
  )
}

const ApplicationListItem: React.FC<ApplicationListItemProps> = ({ application, key }) => {
  return (
    <li key={key}>
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