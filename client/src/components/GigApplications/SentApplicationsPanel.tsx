import { TabPanel } from "@headlessui/react";
import { useGetApi } from "../../hooks/useGetApi";
import type { ApplicationListItemProps, SentApplicationResponse } from "../../types/application";
import { Spinner } from "../Spinner";

const SentApplicationsPanel = () => {
  const { data, loading, error } = useGetApi<SentApplicationResponse>('/api/gigs/applications/sent');

  if (error) {
    return <div>{error}</div>
  }

  if (loading || !data) {
    return (
      <Spinner />
    )
  }

  return (
    <TabPanel>
      <ul>
        {data.application.map((app, i) => <ApplicationListItem key={i} application={app} />)}
      </ul>
    </TabPanel>
  )
}

const ApplicationListItem: React.FC<ApplicationListItemProps> = ({ application, key }) => {
  return (
    <li key={key}>
      <div>For:&nbsp;{application.gig.title}</div>
      <span>{application.message}</span>
    </li>
  )
}

export default SentApplicationsPanel;