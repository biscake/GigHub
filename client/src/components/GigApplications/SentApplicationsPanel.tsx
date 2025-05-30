import { useGetApi } from "../../hooks/useGetApi";
import type { ApplicationListItemProps, SentApplicationResponse } from "../../types/application";
import { timeAgo } from "../../utils/timeAgo";
import ApplicationListButton from "./ApplicationListButton";
import ApplicationListContent from "./ApplicationListContent";
import ApplicationDisclosureContainer from "./ApplicationDisclosureContainer";
import ApplicationPanel from "./ApplicationPanel";

const SentApplicationsPanel = () => {
  const { data, loading, error } = useGetApi<SentApplicationResponse>('/api/gigs/applications/sent');

  return (
    <ApplicationPanel title="Sent" error={error} loading={loading}>
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
        <ApplicationListContent title="Gig Author">
          {application.gig.author.username}
        </ApplicationListContent>
        <span>Sent {timeAgo(application.createdAt)}</span>
        <div className="flex items-center">
          <div className="ml-auto flex gap-3">
            <ApplicationListButton className="bg-[#dac8c0]">Edit</ApplicationListButton>
            <ApplicationListButton className="bg-[#56362a]">Cancel Application</ApplicationListButton>
            <ApplicationListButton className="bg-[#b38b82]">View Gig</ApplicationListButton>
          </div>
        </div>
      </ApplicationDisclosureContainer>
    </li>
  )
}

export default SentApplicationsPanel;