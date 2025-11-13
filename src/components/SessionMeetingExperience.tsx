import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import {
  Bot,
  Copy,
  Ellipsis,
  Hand,
  MessageSquare,
  Mic,
  MicOff,
  Monitor,
  PhoneOff,
  Share2,
  Smile,
  Sparkles,
  Timer,
  Users,
  Video,
  VideoOff,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getBaseOrigin } from "@/lib/sessionStorage";

type ChatMessage = {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  source: "participant" | "instructor" | "bot";
};

const formatTimestamp = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

type SessionMeetingExperienceProps = {
  sessionId?: string;
  courseTitle?: string;
  shareLink?: string;
};

const CAPTIONS = [
  "Welcome! Today we’ll explore advanced algebra concepts together.",
  "Notice how the graph shifts when we adjust the coefficient.",
  "Try pausing here to solve the practice problem on your own.",
  "Great question! Let’s break that into smaller steps.",
];

const SessionMeetingExperience = ({ sessionId, courseTitle = "AI Instructor Masterclass", shareLink }: SessionMeetingExperienceProps) => {
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("Guest Learner");
  const [isJoined, setIsJoined] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [showCaptions, setShowCaptions] = useState(false);
  const [activeTab, setActiveTab] = useState("session-chat");
  const [chatInput, setChatInput] = useState("");
  const [captionIndex, setCaptionIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const { style: bodyStyle } = document.body;
    const { style: htmlStyle } = document.documentElement;
    const previousBodyOverflow = bodyStyle.overflow;
    const previousHtmlOverflow = htmlStyle.overflow;

    bodyStyle.overflow = "hidden";
    htmlStyle.overflow = "hidden";

    return () => {
      bodyStyle.overflow = previousBodyOverflow;
      htmlStyle.overflow = previousHtmlOverflow;
    };
  }, []);


  const [sessionChat, setSessionChat] = useState<ChatMessage[]>([
    {
      id: "session-1",
      sender: "Facilitator",
      message: "Welcome everyone! We'll start the lesson in a minute.",
      timestamp: "09:58",
      source: "instructor",
    },
    {
      id: "session-2",
      sender: "Taylor",
      message: "Can we get the worksheet link shared here?",
      timestamp: "09:59",
      source: "participant",
    },
  ]);

  const [chatbotMessages, setChatbotMessages] = useState<ChatMessage[]>([
    {
      id: "bot-1",
      sender: "AI Tutor",
      message: "Hi! Ask me anything about today's topic and I'll help you out.",
      timestamp: "09:57",
      source: "bot",
    },
  ]);

  const [mediaError, setMediaError] = useState<string | null>(null);
  const [isRequestingMedia, setIsRequestingMedia] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const stageVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const resolvedShareLink = useMemo(() => {
    if (shareLink) {
      return shareLink;
    }
    if (sessionId) {
      return `${getBaseOrigin()}/session/${sessionId}`;
    }
    return getBaseOrigin();
  }, [shareLink, sessionId]);

  useEffect(() => {
    if (!showCaptions) {
      setCaptionIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setCaptionIndex((prev) => (prev + 1) % CAPTIONS.length);
    }, 4000);

    return () => {
      window.clearInterval(interval);
    };
  }, [showCaptions]);

  const currentCaption = CAPTIONS[captionIndex];

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(resolvedShareLink);
        toast({
          title: "Link copied",
          description: "Share this link with learners to invite them to the session.",
        });
        return;
      }
      throw new Error("Clipboard API unavailable");
    } catch (error) {
      console.error(error);
      if (typeof window !== "undefined") {
        window.prompt("Copy this session link:", resolvedShareLink);
      }
      toast({
        title: "Session link ready",
        description: resolvedShareLink,
      });
    }
  };

  const stopStream = (stream: MediaStream | null) => {
    stream?.getTracks().forEach((track) => track.stop());
  };

  const canAccessMedia = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

  useEffect(() => {
    const shouldRequestStream = (isCameraOn || isMicOn) && canAccessMedia;

    if (!shouldRequestStream) {
      stopStream(streamRef.current);
      streamRef.current = null;
      setLocalStream(null);
      setIsRequestingMedia(false);
      return;
    }

    if (streamRef.current) {
      return;
    }

    let isCancelled = false;

    const requestStream = async () => {
      try {
        setIsRequestingMedia(true);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (isCancelled) {
          stopStream(stream);
          return;
        }

        streamRef.current = stream;
        setLocalStream(stream);
        setMediaError(null);
      } catch (error) {
        console.error("Unable to access media devices", error);
        if (!isCancelled) {
          setMediaError("Unable to access camera or microphone. Please allow permissions and try again.");
        }
      } finally {
        if (!isCancelled) {
          setIsRequestingMedia(false);
        }
      }
    };

    requestStream();

    return () => {
      isCancelled = true;
    };
  }, [isCameraOn, isMicOn, canAccessMedia]);

  useEffect(() => {
    const stream = streamRef.current;
    if (!stream) {
      return;
    }

    stream.getVideoTracks().forEach((track) => {
      track.enabled = isCameraOn;
    });
  }, [isCameraOn]);

  useEffect(() => {
    const stream = streamRef.current;
    if (!stream) {
      return;
    }

    stream.getAudioTracks().forEach((track) => {
      track.enabled = isMicOn;
    });
  }, [isMicOn]);

  useEffect(() => {
    const stream = streamRef.current;

    const attachStream = (video: HTMLVideoElement | null) => {
      if (!video) {
        return;
      }

      if (stream && isCameraOn) {
        if (video.srcObject !== stream) {
          video.srcObject = stream;
        }
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => undefined);
        }
      } else {
        video.srcObject = null;
      }
    };

    attachStream(previewVideoRef.current);
    attachStream(stageVideoRef.current);
  }, [localStream, isCameraOn, isJoined]);

  useEffect(() => {
    return () => {
      stopStream(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  const participantCount = useMemo(() => (isJoined ? 32 : 0), [isJoined]);

  const handleJoinSession = () => {
    setIsJoined(true);
  };

  const handleLeaveSession = () => {
    setIsJoined(false);
    setShowCaptions(false);
  };

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!chatInput.trim()) {
      return;
    }

    const payload: ChatMessage = {
      id: `local-${Date.now()}`,
      sender: displayName || "You",
      message: chatInput.trim(),
      timestamp: formatTimestamp(),
      source: "participant",
    };

    if (activeTab === "session-chat") {
      setSessionChat((prev) => [...prev, payload]);
    } else if (activeTab === "chatbot") {
      setChatbotMessages((prev) => [...prev, payload]);

      setTimeout(() => {
        setChatbotMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: "AI Tutor",
            message: "Great question! I'll break that down right after this section.",
            timestamp: formatTimestamp(),
            source: "bot",
          },
        ]);
      }, 600);
    }

    setChatInput("");
  };

  const previewContent = (() => {
    if (isCameraOn && localStream) {
      return (
        <video ref={previewVideoRef} className="h-full w-full object-cover" muted playsInline autoPlay />
      );
    }

    if (isRequestingMedia) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div>
            <p className="font-semibold text-foreground">Connecting to your camera…</p>
            <p className="text-sm">Grant access if prompted so others can see you.</p>
          </div>
        </div>
      );
    }

    if (!canAccessMedia) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 bg-background/80 text-center">
          <VideoOff className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Camera access is not supported in this browser or environment.</p>
        </div>
      );
    }

    if (mediaError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 bg-background/80 text-center">
          <VideoOff className="h-10 w-10 text-destructive" />
          <p className="text-sm text-destructive">{mediaError}</p>
          <p className="text-xs text-muted-foreground">Check your device settings and refresh to try again.</p>
        </div>
      );
    }

    if (isCameraOn) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/15">
            <Video className="h-10 w-10 text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">Waiting for permission</p>
            <p className="text-sm">Allow camera access to preview yourself before joining.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-background/80 text-center">
        <VideoOff className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Camera is turned off</p>
      </div>
    );
  })();

  if (!isJoined) {
    return (
      <Card className="overflow-hidden border border-border">
        <div className="grid gap-8 p-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
              <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-[28px] border border-border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-2xl aspect-video">
              {previewContent}

              <div className="absolute inset-x-4 bottom-4 flex justify-center gap-3">
                <Button
                  variant={isMicOn ? "secondary" : "destructive"}
                  className="gap-2"
                  onClick={() => setIsMicOn((prev) => !prev)}
                >
                  {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  {isMicOn ? "Mute" : "Unmute"}
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/50 p-4 text-sm">
              <p className="font-semibold text-foreground">Preview your setup</p>
              <p className="text-muted-foreground">
                Toggle your microphone and camera before joining. You can update these settings once you are inside the
                live classroom as well.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Class</p>
              <h2 className="text-2xl font-semibold text-foreground">{courseTitle}</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="How should others see you?"
              />
            </div>

            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-medium text-muted-foreground">Meeting ID</p>
              <p className="font-mono text-lg text-foreground">{sessionId ?? "Will be shared automatically"}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Share this ID or the invite link with learners who need to join.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="outline" className="gap-2" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4" />
                  Copy Link
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Button size="lg" className="w-full gap-2" onClick={handleJoinSession}>
                <Video className="h-4 w-4" />
                Join Session
              </Button>
              <p className="text-xs text-muted-foreground">
                When you join, you&apos;ll enter the live classroom with AI guidance, collaborative chat, and real-time
                Q&amp;A tools.
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex min-h-screen h-screen flex-col overflow-hidden text-foreground">
      <main className="flex flex-1 min-h-0 flex-col overflow-hidden md:flex-row">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-1 min-h-0 flex-col overflow-hidden relative"
        >
          <div className="relative w-full h-full min-h-0 overflow-hidden">
                <div className="absolute inset-x-0 top-0 z-20 flex justify-end">
                  <div className="flex flex-wrap items-center gap-2 rounded-full bg-black/45 px-4 py-1 text-xs font-medium text-white shadow-lg backdrop-blur">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 rounded-full px-3 text-white hover:bg-white/10"
                      onClick={() => setShowModal((prev) => !prev)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Chat
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 rounded-full px-3 text-white hover:bg-white/10">
                      <Users className="h-4 w-4" />
                      People
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 rounded-full px-3 text-white hover:bg-white/10">
                      <Hand className="h-4 w-4" />
                      Raise
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 rounded-full px-3 text-white hover:bg-white/10">
                      <Smile className="h-4 w-4" />
                      React
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-2 rounded-full px-3 text-white hover:bg-white/10 ${showCaptions ? "bg-white/20" : ""}`}
                      onClick={() => setShowCaptions((prev) => !prev)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Captions
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 rounded-full px-3 text-white hover:bg-white/10">
                      <Ellipsis className="h-4 w-4" />
                      More
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-2 rounded-full px-3 ${isMicOn ? "bg-white/10 text-white hover:bg-white/20" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}`}
                      onClick={() => setIsMicOn((prev) => !prev)}
                    >
                      {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                      {isMicOn ? "Mic on" : "Mic off"}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 rounded-full px-3 text-white hover:bg-white/10" onClick={handleCopyLink}>
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                    <Button variant="destructive" size="sm" className="gap-2 rounded-full px-3" onClick={handleLeaveSession}>
                      <PhoneOff className="h-4 w-4" />
                      Leave
                    </Button>
                  </div>
                </div>
                <video
                  className="full-size object-cover object-center"
                  src="https://lesson-banners.s3.us-east-1.amazonaws.com/Scorms/3a98d3a3-efc5-461d-9b60-7a1febc71947.mp4"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                <div className="absolute left-4 top-4 flex items-center gap-0 rounded-full bg-red-600/90 px-3 py-1 text-xs font-semibold text-white shadow-lg animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-white" />
                  Live now
                </div>

                <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow">
                  <Timer className="h-3 w-3" />
                  00:12 elapsed
                </div>

                {isCameraOn && localStream ? (
                  <div className="absolute bottom-4 right-4 h-32 w-32 overflow-hidden rounded-xl border border-background/40 bg-background/80 shadow-lg backdrop-blur">
                    <video ref={stageVideoRef} className="h-full w-full object-cover" muted playsInline autoPlay />
                  </div>
                ) : null}

                {showCaptions && (
                  <div className="absolute bottom-6 left-1/2 w-[90%] max-w-xl -translate-x-1/2 rounded-lg bg-background/90 px-4 py-3 text-center text-sm font-medium text-foreground shadow-lg">
                    {currentCaption}
                  </div>
                )}

                {mediaError && (
                  <div className="absolute bottom-4 left-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive shadow-sm z-30">
                    {mediaError}
                  </div>
                )}
              </div>
        </motion.section>

        {showModal && (
          <aside className="flex h-full min-h-0 w-full max-w-md flex-col border-t border-border bg-muted/20 backdrop-blur md:border-l md:border-t-0 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border px-5 py-4 flex-shrink-0">
              <div>
                <h3 className="text-base font-semibold">Meeting chat</h3>
                <p className="text-xs text-muted-foreground">Chat, AI tutor, and resources</p>
              </div>
              <Button variant="outline" size="icon" className="rounded-full">
                <Ellipsis className="h-4 w-4" />
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 min-h-0 flex-col px-5 py-4 overflow-y-auto">
              <TabsList className="flex-shrink-0 grid w-full grid-cols-3 rounded-xl bg-muted/50 p-1">
                <TabsTrigger
                  value="session-chat"
                  className="rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  Session
                </TabsTrigger>
                <TabsTrigger
                  value="chatbot"
                  className="rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  AI Tutor
                </TabsTrigger>
                <TabsTrigger
                  value="resources"
                  className="rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  Resources
                </TabsTrigger>
              </TabsList>

              <div className="h-full flex-1 min-h-0 overflow-hidden rounded-2xl border border-border/60 bg-background/80 shadow-inner p-0">
                <TabsContent value="session-chat" className="h-full">
                  <ScrollArea className="h-full px-4 py-4">
                    <div className="space-y-4">
                      {sessionChat.map((message) => (
                        <div key={message.id} className={`flex ${message.source === "participant" ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                              message.source === "participant"
                                ? "bg-primary/90 text-primary-foreground shadow-md"
                                : message.source === "instructor"
                                ? "bg-background text-foreground shadow-sm"
                                : "bg-secondary text-secondary-foreground"
                            }`}
                          >
                            <p className="font-medium">{message.sender}</p>
                            <p>{message.message}</p>
                            <p className="mt-1 text-[10px] uppercase tracking-wide opacity-70">{message.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="chatbot" className="h-full">
                  <ScrollArea className="h-full px-4 py-4">
                    <div className="space-y-4">
                      {chatbotMessages.map((message) => (
                        <div key={message.id} className={`flex ${message.source === "participant" ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                              message.source === "participant" ? "bg-primary/90 text-primary-foreground shadow-md" : "bg-secondary text-secondary-foreground"
                            }`}
                          >
                            <p className="flex items-center gap-2 font-medium">
                              {message.source === "bot" && <Bot className="h-3 w-3" />}
                              {message.sender}
                            </p>
                            <p>{message.message}</p>
                            <p className="mt-1 text-[10px] uppercase tracking-wide opacity-70">{message.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="resources" className="h-full">
                  <div className="flex h-full flex-col gap-3 px-5 py-4 text-sm">
                    <div>
                      <p className="font-medium text-foreground">Lesson Materials</p>
                      <p className="text-muted-foreground">Slides, worksheets, and recordings will appear here.</p>
                    </div>
                    <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                      <li>Interactive whiteboard snapshots</li>
                      <li>Recommended follow-up practice</li>
                      <li>Session transcript (auto-generated)</li>
                    </ul>
                  </div>
                </TabsContent>
              </div>

              <div className="mt-4 flex-shrink-0 rounded-2xl border border-border/60 bg-background/90 p-4 shadow-lg">
                <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
                  <Textarea
                    placeholder={
                      activeTab === "chatbot" ? "Ask the AI tutor a quick question..." : "Share an update or ask the group something..."
                    }
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{displayName || "You"} {isMicOn ? "(mic on)" : "(mic muted)"}</span>
                    <Button type="submit" size="sm" className="gap-2 rounded-full px-4">
                      <MessageSquare className="h-4 w-4" />
                      Send
                    </Button>
                  </div>
                </form>
              </div>
            </Tabs>
          </aside>
        )}
      </main>

    </div>
  );
};

export default SessionMeetingExperience;
