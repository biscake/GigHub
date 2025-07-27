import { memo, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useGetApi } from "../../hooks/useGetApi";
import api from "../../lib/api";
import type { GetApplicationResponse } from "../../types/api";
import type { ApplicationListItemProps, ReceivedApplicationsPanelProps } from "../../types/application";
import { timeAgo } from "../../utils/timeAgo";
import ApplicationDisclosureContainer from "./ApplicationDisclosureContainer";
import ApplicationListButton from "./ApplicationListButton";
import ApplicationListContent from "./ApplicationListContent";
import ApplicationPanel from "./ApplicationPanel";
import { useIdempotencyKey } from "../../hooks/useIdempotencyKey";
import { callApplicationStatsRefetch } from "../../utils/applicationStatsRefetch";

const ReceivedApplicationsPanel: React.FC<ReceivedApplicationsPanelProps> = memo(({ page, setTotalPages }) => {
  const idempotencyKey = useIdempotencyKey();

  const opts = useMemo(() => ({
    params: {
      page
    }
  }), [page]);

  const { data, loading, error, refetch } = useGetApi<GetApplicationResponse>('/api/gigs/applications/received', opts);

  useEffect(() => {
    if (!data) return;
    setTotalPages(data.totalPages);
  }, [setTotalPages, data]);

  const acceptGig = async (gigId: number, applicationId: number) => {
    try {
      await api.put(`/api/gigs/${gigId}/applications/${applicationId}/accept`, {}, {
        headers: {
          'Idempotency-Key': idempotencyKey.get()
        }
      });

      refetch();
      callApplicationStatsRefetch();
    } catch (err) {
      console.error(err);
    } finally {
      idempotencyKey.clear();
    }
  }

  const rejectGig = async (gigId: number, applicationId: number) => {
    try {
      await api.put(`/api/gigs/${gigId}/applications/${applicationId}/reject`, {}, {
        headers: {
          'Idempotency-Key': idempotencyKey.get()
        }
      });

      refetch();
      callApplicationStatsRefetch();
    } catch (err) {
      console.error(err);
    } finally {
      idempotencyKey.clear();
    }
  }

  return (
    <ApplicationPanel title="Received" error={error} loading={loading}>
      {data && data.applications && data.applications.length > 0
        ? data.applications.map((app, i) =>
          <ApplicationListItem
            key={i}
            application={app}
            handleAccept={() => acceptGig(app.gig.id, app.id)}
            handleReject={() => rejectGig(app.gig.id, app.id)}
          />  
        )
        : <span>No Applications Found</span>
      }
    </ApplicationPanel>
  )
})

const ApplicationListItem: React.FC<ApplicationListItemProps> = ({ application, handleAccept, handleReject }) => {
  return (
    <li>
      <ApplicationDisclosureContainer title={application.gig.title}>
        <ApplicationListContent title="Message">
          {application.message}
        </ApplicationListContent>
        <ApplicationListContent title="Applicant">
          <Link to={`/${application.user.username}/profile`}>
            {application.user.username}
          </Link>
        </ApplicationListContent>
        <span>Applied {timeAgo(application.createdAt)}</span>
        <div className="flex items-center">
          <div className="ml-auto flex gap-3">
            <ApplicationListButton className="bg-[#dac8c0]" onClick={handleReject}>Decline</ApplicationListButton>
            <ApplicationListButton className="bg-[#b38b82]" onClick={handleAccept}>Accept</ApplicationListButton>
          </div>
        </div>
      </ApplicationDisclosureContainer>
    </li>
  )
}

export default ReceivedApplicationsPanel;