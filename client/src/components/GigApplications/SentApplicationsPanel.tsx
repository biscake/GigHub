import type { AxiosError } from "axios";
import { memo, useEffect, useMemo, useState } from "react";
import { useGetApi } from "../../hooks/useGetApi";
import { useIdempotencyKey } from "../../hooks/useIdempotencyKey";
import api from "../../lib/api";
import type { ApiErrorResponse, GetApplicationResponse } from "../../types/api";
import type { ApplicationListItemProps, SentApplicationsPanelProps } from "../../types/application";
import type { GetGigAuthorResponse, Gig } from "../../types/gig";
import { timeAgo } from "../../utils/timeAgo";
import ApplicationDisclosureContainer from "./ApplicationDisclosureContainer";
import ApplicationListButton from "./ApplicationListButton";
import ApplicationListContent from "./ApplicationListContent";
import ApplicationPanel from "./ApplicationPanel";
import GigModal from "../GigModal/GigModal";
import { callApplicationStatsRefetch } from "../../utils/applicationStatsRefetch";
import { Link } from "react-router-dom";

const SentApplicationsPanel: React.FC<SentApplicationsPanelProps> = memo(({ page, setTotalPages }) => {
  const idempotencyKey = useIdempotencyKey();
  const [selectedGigView, setSelectedGigView] = useState<Gig | null>(null);

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


  const handleCancelApplication = async (applicationId: number) => {
    try {
      await api.delete(`/api/gigs/applications/${applicationId}`, {
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

  const handleEditMessage = async (message: string, applicationId: number) => {
    try {
      await api.put(`/api/gigs/applications/${applicationId}/edit`, { message }, {
        headers: {
          'Idempotency-Key': idempotencyKey.get()
        }
      });

      refetch();
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      console.log(error);
    } finally {
      idempotencyKey.clear();
    }
  }

  return (
    <>
      <GigModal gig={selectedGigView} setSelectedGig={setSelectedGigView} isViewMode={true} />
      <ApplicationPanel title="Sent" error={error} loading={loading}>
        {data && data.applications && data?.applications.length > 0
          ? data.applications.map((app, i) =>
            <ApplicationListItem
              key={i}
              application={app}
              handleCancelApplication={() => handleCancelApplication(app.id)}
              handleViewGig={() => setSelectedGigView(app.gig)}
              handleEditMessage={handleEditMessage}
            />)
          : <span>No Applications Found</span>
        }
      </ApplicationPanel>
    </>
  )
})

const ApplicationListItem: React.FC<ApplicationListItemProps> = ({ application, handleCancelApplication, handleEditMessage, handleViewGig }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(application?.message ?? "");

  const author = application.gig.author?.username;

  const handleCancelEdit = () => {
    setMessage(application?.message ?? "");
    setIsEditing(false);
  }

  const handleSubmitEdit = () => {
    if (!handleEditMessage) throw new Error("handleEditMessage not passed as prop");
    handleEditMessage(message, application.id);
    setIsEditing(false);
  }

  return (
    <li>
      <ApplicationDisclosureContainer title={application.gig.title}>
        <ApplicationListContent title="Message">
          {!isEditing
            ? application.message
            : <textarea className="w-full resize-none p-2 bg-white rounded-lg" rows={4} value={message} onChange={(e) => setMessage(e.target.value)}/>
          }
        </ApplicationListContent>
        <ApplicationListContent title="Gig Author">
          <Link to={`/${author}/profile`}>
            {author}
          </Link>
        </ApplicationListContent>
        <span>Sent {timeAgo(application.createdAt)}</span>
        <div className="flex items-center">
          <div className="ml-auto flex gap-3">
            {!isEditing && 
              <>
                <ApplicationListButton className="bg-[#dac8c0]" onClick={() => setIsEditing(true)}>Edit</ApplicationListButton>
                <ApplicationListButton onClick={handleCancelApplication} className="bg-[#56362a]">Cancel Application</ApplicationListButton>
                <ApplicationListButton className="bg-[#b38b82]" onClick={handleViewGig}>View Gig</ApplicationListButton>
              </>
            }
            {isEditing && 
              <>
                <ApplicationListButton onClick={handleCancelEdit} className="bg-[#56362a]">Cancel</ApplicationListButton>
                <ApplicationListButton className="bg-[#b38b82]" onClick={handleSubmitEdit}>Confirm edit</ApplicationListButton>
              </>
            }
          </div>
        </div>
      </ApplicationDisclosureContainer>
    </li>
  )
}

export default SentApplicationsPanel;