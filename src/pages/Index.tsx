import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, CalendarDays, Video, Copy, ChevronLeft, ChevronRight } from "lucide-react";
import { loadSessions, SessionRecord } from "@/lib/sessionStorage";
import { useToast } from "@/hooks/use-toast";
import "./Index.css";

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
  const [liveCarouselPos, setLiveCarouselPos] = useState(0);
  const [upcomingCarouselPos, setUpcomingCarouselPos] = useState(0);
  const [completedCarouselPos, setCompletedCarouselPos] = useState(0);
  const liveRef = useRef<HTMLDivElement | null>(null);
  const upcomingRef = useRef<HTMLDivElement | null>(null);
  const completedRef = useRef<HTMLDivElement | null>(null);

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
      <Card key={session.id} className="border border-border shadow-sm hover:shadow-md transition-all duration-300 flex-shrink-0 carousel-card flex flex-col"
      style={{ width: '340px', height: '260px' }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold text-foreground truncate">{session.course}</CardTitle>
              <p className="text-xs text-muted-foreground truncate mt-1">{session.instructor}</p>
            </div>
            <Badge
              variant={
                session.status === "Active"
                  ? "default"
                  : session.status === "Scheduled"
                    ? "secondary"
                    : "outline"
              }
              className="flex-shrink-0 text-xs"
            >
              {session.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-1 space-y-5 flex-1 text-xs text-muted-foreground">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span className="truncate">{session.students} learners</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span className="truncate">{session.duration}</span>
            </div>
          </div>
          {scheduledAt && (
            <div className="flex items-center gap-2 pt-1">
              <CalendarDays className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span className="truncate text-foreground text-xs">{scheduledAt}</span>
            </div>
          )}
          <div className="flex items-center gap-1 pt-1 text-xs">
            <span className="font-medium text-foreground">ID:</span>
            <span className="font-mono text-xs text-muted-foreground truncate">{session.meetingId}</span>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={() => handleJoinSession(session)} size="sm" className="gap-1.5 text-xs h-8" disabled={isJoinDisabled}>
              <Video className="h-3.5 w-3.5" />
              Join
            </Button>
            <Button variant="outline" onClick={() => copySessionLink(session.shareLink)} size="sm" className="gap-1.5 text-xs h-8">
              <Copy className="h-3.5 w-3.5" />
              Copy Link
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const CARD_WIDTH = 340; // px - should match CSS
  const GAP = 16; // px gap between items

  const scrollBy = (container: HTMLDivElement | null, dir: number) => {
    if (!container) return;
    const amount = dir * (CARD_WIDTH + GAP);
     // Get the max scrollable width
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    // Only scroll if there's more content to scroll
    if (container.scrollLeft + amount > maxScroll) {
      container.scrollLeft = maxScroll;
    } else if (container.scrollLeft + amount < 0) {
      container.scrollLeft = 0;
    } else {
      container.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const renderEmblaCarousel = (items: SessionRecord[], ref?: React.RefObject<HTMLDivElement>) => {
    if (items.length === 0) return null;

    return (
      <div className="scroller-wrapper group">
        <button
          className="scroller-nav scroller-prev opacity-0 group-hover:opacity-100"
          aria-label="Previous"
          onClick={() => scrollBy(ref?.current ?? null, -1)}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div
          ref={ref}
          className="card-scroller"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") scrollBy(ref?.current ?? null, -1);
            if (e.key === "ArrowRight") scrollBy(ref?.current ?? null, 1);
          }}
        >
          {items.map((session) => (
            <div key={session.id} className="card-scroller-item">
              {renderSessionCard(session)}
            </div>
          ))}
        </div>

        <button
          className="scroller-nav scroller-next opacity-0 group-hover:opacity-100"
          aria-label="Next"
          onClick={() => scrollBy(ref?.current ?? null, 1)}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="fixed left-0 top-0 h-full w-64">
        <Sidebar />
      </div>

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
                  renderEmblaCarousel(liveSessions)
                ) : (
                  <Card className="border border-dashed border-border bg-muted/40 p-8 text-sm text-muted-foreground empty-state-card text-center">
                    <p>No sessions are live right now. Check upcoming sessions or wait for an instructor to go live.</p>
                  </Card>
                )}
              </section>

              <section className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">Upcoming Sessions</h2>
                  <p className="text-sm text-muted-foreground">Join early to get your setup ready.</p>
                </div>
                {upcomingSessions.length > 0 ? (
                  renderEmblaCarousel(upcomingSessions)
                ) : (
                  <Card className="border border-dashed border-border bg-muted/40 p-8 text-sm text-muted-foreground empty-state-card text-center">
                    <p>No upcoming sessions scheduled yet. Check back soon or contact your instructor.</p>
                  </Card>
                )}
              </section>
            </div>

          </div>

          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Completed Sessions</h2>
              <p className="text-sm text-muted-foreground">Catch up on classes you might have missed.</p>
            </div>
            {completedSessions.length > 0 ? (
              renderEmblaCarousel(completedSessions)
            ) : (
              <Card className="border border-dashed border-border bg-muted/40 p-8 text-sm text-muted-foreground empty-state-card text-center">
                <p>Completed sessions will appear here once your classes finish.</p>
              </Card>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;
