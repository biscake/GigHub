import { memo, useEffect, useMemo, useState } from "react";
import { useGetApi } from "../../hooks/useGetApi";
import type { ApplicationListItemProps, GetApplicationResponse, SentApplicationsPanelProps } from "../../types/application";
import { timeAgo } from "../../utils/timeAgo";
import ApplicationDisclosureContainer from "./ApplicationDisclosureContainer";
import ApplicationListButton from "./ApplicationListButton";
import ApplicationListContent from "./ApplicationListContent";
import ApplicationPanel from "./ApplicationPanel";
import api from "../../lib/api";
import { v4 as uuidv4 } from "uuid";

const SentApplicationsPanel: React.FC<SentApplicationsPanelProps> = memo(({ page, setTotalPages }) => {
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);

  const opts = useMemo(() => ({
    params: {
      page
    }
  }), [page]);

  const { data, loading, error, refetch } = useGetApi<GetApplicationResponse>('/api/gigs/applications/sent', opts);

  useEffect(() => {
    if (!data) return;
    setTotalPages(data.totalPages);
  }, [setTotalPages, data]);


  const handleCancelApplication = () => {
    try {

    }
  }

  return (
    <ApplicationPanel title="Sent" error={error} loading={loading}>
      {data && data.applications && data?.applications.length > 0
        ? data.applications.map((app, i) => <ApplicationListItem key={i} application={app} />)
        : <span>No Applications Found</span>
      }
    </ApplicationPanel>
  )
})

const ApplicationListItem: React.FC<ApplicationListItemProps> = ({ application, handleCancelApplication, handleEdit, handleViewGig }) => {
  const handleCancel = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const idempotencyKey = uuidv4();

    try {
      await api.delete(`/api/gigs/applications/${application.id}`, {
        headers: {
          "Idempotency-Key": idempotencyKey
        }
      });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <li>
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
            <ApplicationListButton onClick={handleCancel} className="bg-[#56362a]">Cancel Application</ApplicationListButton>
            <ApplicationListButton className="bg-[#b38b82]">View Gig</ApplicationListButton>
          </div>
        </div>
      </ApplicationDisclosureContainer>
    </li>
  )
}

export default SentApplicationsPanel;