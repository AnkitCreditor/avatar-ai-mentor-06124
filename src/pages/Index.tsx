import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import SessionInfo from "@/components/SessionInfo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, CalendarDays, Video, Copy } from "lucide-react";
import { loadSessions, SessionRecord } from "@/lib/sessionStorage";
import { useToast } from "@/hooks/use-toast";

const formatSchedule = (value?: string) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<SessionRecord[]>(() => loadSessions());

  useEffect(() => {
    const refreshSessions = () => {
      setSessions(loadSessions());
    };

    window.addEventListener("virtual-instructor:sessions-updated", refreshSessions);
    window.addEventListener("storage", refreshSessions);

    return () => {
      window.removeEventListener("virtual-instructor:sessions-updated", refreshSessions);
      window.removeEventListener("storage", refreshSessions);
    };
  }, []);

  const liveSessions = useMemo(
    () => sessions.filter((session) => session.status === "Active"),
    [sessions],
  );
  const upcomingSessions = useMemo(
    () => sessions.filter((session) => session.status === "Scheduled"),
    [sessions],
  );
  const completedSessions = useMemo(
    () => sessions.filter((session) => session.status === "Completed"),
    [sessions],
  );

  const handleJoinSession = (session: SessionRecord) => {
    const url = `/session/${session.meetingId}`;
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      navigate(url);
    }
  };

  const copySessionLink = async (link: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
        toast({
          title: "Link copied",
          description: "Share this link with learners to invite them into the session.",
        });
        return;
      }
      throw new Error("Clipboard API unavailable");
    } catch (error) {
      console.error(error);
      if (typeof window !== "undefined") {
        window.prompt("Copy this session link:", link);
      }
      toast({
        title: "Session link ready",
        description: link,
      });
    }
  };

  const renderSessionCard = (session: SessionRecord) => {
    const scheduledAt = formatSchedule(
      typeof session.config === "object" && session.config
        ? (session.config as Record<string, unknown>).schedule as string
        : undefined,
    );

    const isJoinDisabled = session.status !== "Active";

    return (
      <Card key={session.id} className="border border-border shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl text-foreground">{session.course}</CardTitle>
            <p className="text-sm text-muted-foreground">{session.instructor}</p>
          </div>
          <Badge
            variant={
              session.status === "Active"
                ? "default"
                : session.status === "Scheduled"
                  ? "secondary"
                  : "outline"
            }
          >
            {session.status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-3">
            <Users className="h-4 w-4 text-primary" />
            <span>{session.students} learners enrolled</span>
            <span>•</span>
            <Clock className="h-4 w-4 text-primary" />
            <span>{session.duration}</span>
          </div>
          {scheduledAt && (
            <div className="flex items-center gap-3">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span className="text-foreground">{scheduledAt}</span>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">Meeting ID:</span>
            <span className="font-mono text-xs sm:text-sm">{session.meetingId}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleJoinSession(session)} className="gap-2" disabled={isJoinDisabled}>
              <Video className="h-4 w-4" />
              Join Session
            </Button>
            <Button variant="outline" onClick={() => copySessionLink(session.shareLink)} className="gap-2">
              <Copy className="h-4 w-4" />
              Copy Invite Link
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Virtual Instructor</h1>
            <p className="text-muted-foreground">
              Jump into live sessions, review upcoming classes, and stay ready for AI-powered instruction.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <section className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">Live Sessions</h2>
                  <p className="text-sm text-muted-foreground">Sessions currently in progress.</p>
                </div>
                {liveSessions.length > 0 ? (
                  <div className="space-y-4">
                    {liveSessions.map((session) => renderSessionCard(session))}
                  </div>
                ) : (
                  <Card className="border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
                    No sessions are live right now. Check upcoming sessions or wait for an instructor to go live.
                  </Card>
                )}
              </section>

              <section className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">Upcoming Sessions</h2>
                  <p className="text-sm text-muted-foreground">Join early to get your setup ready.</p>
                </div>
                {upcomingSessions.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => renderSessionCard(session))}
                  </div>
                ) : (
                  <Card className="border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
                    No upcoming sessions scheduled yet. Check back soon or contact your instructor.
                  </Card>
                )}
              </section>
            </div>

            <div className="space-y-6">
              <SessionInfo />
            </div>
          </div>

          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Completed Sessions</h2>
              <p className="text-sm text-muted-foreground">Catch up on classes you might have missed.</p>
            </div>
            {completedSessions.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedSessions.map((session) => (
                  <Card key={session.id} className="border border-border">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="text-lg text-foreground">{session.course}</CardTitle>
                        <Badge variant="outline">Completed</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span>{session.students} learners attended</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{session.duration}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
                Completed sessions will appear here once your classes finish.
              </Card>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;
