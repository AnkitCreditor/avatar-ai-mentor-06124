const STORAGE_KEY = "virtual-instructor:sessions";
const FALLBACK_ORIGIN = "https://virtual-instructor.example";

export type SessionStatus = "Active" | "Scheduled" | "Completed";

export type SessionRecord = {
  id: number;
  course: string;
  instructor: string;
  status: SessionStatus;
  students: number;
  duration: string;
  meetingId: string;
  shareLink: string;
  config?: Record<string, unknown> | null;
};

export const getBaseOrigin = () =>
  typeof window !== "undefined" && window.location.origin
    ? window.location.origin
    : FALLBACK_ORIGIN;

export const generateMeetingId = () => `VI-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export const buildShareLink = (meetingId: string) => `${getBaseOrigin()}/session/${meetingId}`;

const createBaseSessions = (): SessionRecord[] => {
  const templates: Omit<SessionRecord, "meetingId" | "shareLink">[] = [
    {
      id: 1,
      course: "Advanced Mathematics",
      instructor: "AI Instructor",
      status: "Active",
      students: 24,
      duration: "1h 20m",
    },
    {
      id: 2,
      course: "Physics 101",
      instructor: "AI Instructor",
      status: "Scheduled",
      students: 18,
      duration: "Not started",
    },
    {
      id: 3,
      course: "Chemistry Basics",
      instructor: "AI Instructor",
      status: "Completed",
      students: 32,
      duration: "1h 45m",
    },
  ];

  return templates.map((session) => {
    const meetingId = generateMeetingId();
    return {
      ...session,
      meetingId,
      shareLink: buildShareLink(meetingId),
      config: null,
    };
  });
};

const rehydrateSessions = (sessions: SessionRecord[]): SessionRecord[] => {
  return sessions.map((session, index) => {
    const meetingId = session.meetingId || generateMeetingId();
    return {
      ...session,
      id: session.id ?? index + 1,
      meetingId,
      shareLink: buildShareLink(meetingId),
      config: session.config ?? null,
    };
  });
};

export const loadSessions = (): SessionRecord[] => {
  if (typeof window === "undefined") {
    return createBaseSessions();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaults = createBaseSessions();
      saveSessions(defaults);
      return defaults;
    }

    const parsed = JSON.parse(raw) as SessionRecord[];
    const rehydrated = rehydrateSessions(parsed);
    // ensure share links updated for current origin
    if (JSON.stringify(parsed) !== JSON.stringify(rehydrated)) {
      saveSessions(rehydrated);
    }
    return rehydrated;
  } catch (error) {
    console.error("Failed to load sessions, reinitialising defaults.", error);
    const defaults = createBaseSessions();
    saveSessions(defaults);
    return defaults;
  }
};

export const saveSessions = (sessions: SessionRecord[]) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    window.dispatchEvent(new CustomEvent("virtual-instructor:sessions-updated"));
  } catch (error) {
    console.error("Failed to save sessions", error);
  }
};

export const clearSessions = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
  const defaults = createBaseSessions();
  saveSessions(defaults);
};

