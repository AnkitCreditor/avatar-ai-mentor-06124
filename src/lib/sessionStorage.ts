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
    { id: 1, course: "Advanced Mathematics", instructor: "Dr. Sarah Chen", status: "Active", students: 24, duration: "1h 20m" },
    { id: 2, course: "Web Development Basics", instructor: "Alex Turner", status: "Active", students: 15, duration: "1h 30m" },
    { id: 3, course: "Physics 101", instructor: "Prof. James Wilson", status: "Scheduled", students: 18, duration: "2h" },
    { id: 4, course: "Data Science Fundamentals", instructor: "Dr. Michael Zhang", status: "Scheduled", students: 22, duration: "3h" },
    { id: 5, course: "Machine Learning Intro", instructor: "Dr. Priya Kapoor", status: "Scheduled", students: 30, duration: "2h 30m" },
    { id: 6, course: "Chemistry Basics", instructor: "Dr. Emily Roberts", status: "Completed", students: 32, duration: "1h 45m" },
    { id: 7, course: "English Literature", instructor: "Ms. Rachel Green", status: "Completed", students: 28, duration: "2h" },
    { id: 8, course: "History & Civilization", instructor: "Prof. David Brown", status: "Completed", students: 19, duration: "1h 50m" },
    { id: 9, course: "Graphic Design Basics", instructor: "Samira Ali", status: "Active", students: 12, duration: "1h" },
    { id: 10, course: "Public Speaking", instructor: "Jordan Lee", status: "Scheduled", students: 20, duration: "1h 15m" },
    { id: 11, course: "Algorithms & Data Structures", instructor: "Dr. Kevin Park", status: "Completed", students: 26, duration: "2h 10m" },
    { id: 12, course: "Product Management 101", instructor: "Anna Morales", status: "Scheduled", students: 14, duration: "1h 40m" },
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

    // If stored sessions are missing demos (e.g. older defaults), merge missing demo entries
    const defaults = createBaseSessions();
    const existingCourses = new Set(rehydrated.map((s) => s.course));
    const missing = defaults.filter((d) => !existingCourses.has(d.course));

    if (missing.length > 0) {
      // assign fresh meeting IDs for missing items and append
      const missingWithIds = missing.map((m) => {
        const meetingId = generateMeetingId();
        return { ...m, meetingId, shareLink: buildShareLink(meetingId), config: m.config ?? null };
      });

      const merged = [...rehydrated, ...missingWithIds];
      saveSessions(merged);
      return merged;
    }

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

