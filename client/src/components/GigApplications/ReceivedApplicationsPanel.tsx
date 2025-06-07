import { memo, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useGetApi } from "../../hooks/useGetApi";
import type { ApplicationListItemProps, GetApplicationResponse, ReceivedApplicationsPanelProps } from "../../types/application";
import { timeAgo } from "../../utils/timeAgo";
import ApplicationDisclosureContainer from "./ApplicationDisclosureContainer";
import ApplicationListButton from "./ApplicationListButton";
import ApplicationListContent from "./ApplicationListContent";
import ApplicationPanel from "./ApplicationPanel";
import { v4 as uuidv4 } from 'uuid';
import api from "../../lib/api";
import type { ApiErrorResponse } from "../../types/api";
import type { AxiosError } from "axios";

const ReceivedApplicationsPanel: React.FC<ReceivedApplicationsPanelProps> = memo(({ page, setTotalPages }) => {
  const [apiErr, setApiErr] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);

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
      const key = idempotencyKey ?? uuidv4();
      if (!idempotencyKey) {
        setIdempotencyKey(key);
      }

      await api.put(`/api/gigs/${gigId}/applications/${applicationId}/accept`, {}, {
        headers: {
          'Idempotency-Key': key
        }
      });
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;

      const errorMessage = error.response?.data?.message;

      setApiErr(errorMessage || "Something went wrong. Please try again");
    } finally {
      setIdempotencyKey(null);
    }
  }

  const rejectGig = async (gigId: number, applicationId: number) => {
    try {
      const key = idempotencyKey ?? uuidv4();
      if (!idempotencyKey) {
        setIdempotencyKey(key);
      }

      await api.put(`/api/gigs/${gigId}/applications/${applicationId}/reject`, {}, {
        headers: {
          'Idempotency-Key': key
        }
      });
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;

      const errorMessage = error.response?.data?.message;

      setApiErr(errorMessage || "Something went wrong. Please try again");
    } finally {
      setIdempotencyKey(null);
    }
  }

  return (
    <ApplicationPanel title="Received" error={error} loading={loading}>
      {data && data.applications && data.applications.length > 0
        ? data.applications.map((app, i) =>
          <ApplicationListItem
            key={i}
            application={app}
            refetch={refetch}
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
          <Link to={`/${application.user.username}`}>
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