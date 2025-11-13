import { useMemo } from "react";
import { useParams } from "react-router-dom";
import SessionMeetingExperience from "@/components/SessionMeetingExperience";
import { loadSessions, getBaseOrigin } from "@/lib/sessionStorage";

const SessionRoom = () => {
  const { sessionId = "UNKNOWN" } = useParams<{ sessionId: string }>();
  const session = useMemo(
    () => loadSessions().find((candidate) => candidate.meetingId === sessionId) ?? null,
    [sessionId],
  );

  const shareLink = useMemo(() => {
    if (session?.shareLink) {
      return session.shareLink;
    }
    return `${getBaseOrigin()}/session/${sessionId}`;
  }, [session?.shareLink, sessionId]);

  return (
    <div className="min-h-screen bg-muted ">
      <div className="max-w-7xl mx-auto flex-col gap-0">
        <SessionMeetingExperience
          sessionId={sessionId}
          courseTitle={session?.course ?? "Virtual Instructor Session"}
          shareLink={shareLink}
        />
      </div>
    </div>
  );
};

export default SessionRoom;

