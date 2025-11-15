import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Captions as CaptionsIcon,
  Check,
  Copy,
  Hand,
  Image as ImageIcon,
  Info,
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  PhoneOff,
  Share2,
  Smile,
  Timer,
  Upload,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getBaseOrigin } from "@/lib/sessionStorage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

type SelfieSegmentationResults = {
  segmentationMask: CanvasImageSource;
};

type SelfieSegmentationInstance = {
  setOptions: (options: { modelSelection?: number }) => void;
  onResults: (callback: (results: SelfieSegmentationResults) => void) => void;
  send: (input: { image: HTMLVideoElement }) => Promise<void>;
  close: () => void;
};

const CAPTIONS = [
  "Welcome! Today we’ll explore advanced algebra concepts together.",
  "Notice how the graph shifts when we adjust the coefficient.",
  "Try pausing here to solve the practice problem on your own.",
  "Great question! Let’s break that into smaller steps.",
];

const BACKGROUNDS: { id: string; label: string; image: string | null; thumbnail?: string | null }[] = [
  { id: "none", label: "None", image: null },
  {
    id: "office",
    label: "Modern Office",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=60",
    thumbnail: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=320&q=40",
  },
  {
    id: "library",
    label: "Cozy Library",
    image: "https://images.unsplash.com/photo-1522252234503-e356532cafd5?auto=format&fit=crop&w=1600&q=60",
    thumbnail: "https://images.unsplash.com/photo-1522252234503-e356532cafd5?auto=format&fit=crop&w=320&q=40",
  },
  {
    id: "plants",
    label: "Green Studio",
    image: "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1600&q=60",
    thumbnail: "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=320&q=40",
  },
  {
    id: "city",
    label: "City View",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=60",
    thumbnail: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=320&q=40",
  },
  {
    id: "abstract",
    label: "Abstract Gradient",
    image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=1600&q=60",
    thumbnail: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=320&q=40",
  },
];

const SessionMeetingExperience = ({
  sessionId,
  courseTitle = "AI Instructor Masterclass",
  shareLink,
}: SessionMeetingExperienceProps) => {
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("Guest Learner");
  const [isJoined, setIsJoined] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [showCaptions, setShowCaptions] = useState(false);
  const [activeTab, setActiveTab] = useState("session-chat");
  const [chatInput, setChatInput] = useState("");
  const [captionIndex, setCaptionIndex] = useState(0);
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);
  const [virtualBackgroundError, setVirtualBackgroundError] = useState<string | null>(null);
  const [isApplyingVirtualBackground, setIsApplyingVirtualBackground] = useState(false);
  const [hasRenderedVirtualBackgroundFrame, setHasRenderedVirtualBackgroundFrame] = useState(false);
  const [backgroundTimeoutExceeded, setBackgroundTimeoutExceeded] = useState(false);
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activePanel, setActivePanel] = useState<"chat" | "info" | null>(null);

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

  const [chatbotMessages, setChatbotMessages] = useState<ChatMessage[]>([{
    id: `bot-${Date.now()}`,
    sender: "AI Tutor",
    message: "Hello! How can I help you today?",
    timestamp: formatTimestamp(),
    source: "bot",
  }]);

  const [mediaError, setMediaError] = useState<string | null>(null);
  const [isRequestingMedia, setIsRequestingMedia] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const stageVideoRef = useRef<HTMLVideoElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const segmentationRef = useRef<SelfieSegmentationInstance | null>(null);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isSendingFrameRef = useRef<boolean>(false);
  const customBackgroundUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const appliedBackgroundStyle = selectedBackground
    ? {
      backgroundImage: `url(${selectedBackground})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }
    : undefined;
  const shouldUseVirtualBackground = Boolean(selectedBackground);

  const handleBackgroundSelection = useCallback((image: string | null) => {
    setSelectedBackground(image);
    setVirtualBackgroundError(null);
    setHasRenderedVirtualBackgroundFrame(false);
    setBackgroundTimeoutExceeded(false);
  }, []);

  const handleCustomBackgroundChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      if (!file.type.startsWith("image/")) {
        setVirtualBackgroundError("Please choose an image file for the background.");
        event.target.value = "";
        return;
      }

      if (customBackgroundUrlRef.current) {
        URL.revokeObjectURL(customBackgroundUrlRef.current);
      }

      const objectUrl = URL.createObjectURL(file);
      customBackgroundUrlRef.current = objectUrl;
      setCustomBackground(objectUrl);
      handleBackgroundSelection(objectUrl);
      event.target.value = "";
    },
    [handleBackgroundSelection]
  );

  const handleOpenBackgroundUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  useEffect(() => {
    backgroundImageRef.current = null;
    setVirtualBackgroundError(null);
    setHasRenderedVirtualBackgroundFrame(false);
    setBackgroundTimeoutExceeded(false);

    if (!selectedBackground) {
      return;
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = selectedBackground;

    const handleLoad = () => {
      backgroundImageRef.current = image;
    };

    const handleError = () => {
      backgroundImageRef.current = null;
      setVirtualBackgroundError("Unable to load the selected background. Please choose a different one.");
    };

    image.addEventListener("load", handleLoad);
    image.addEventListener("error", handleError);

    return () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
    };
  }, [selectedBackground]);

  const drawVirtualBackground = useCallback(
    (results: SelfieSegmentationResults) => {
      const video = previewVideoRef.current;
      const mask = results.segmentationMask;
      if (!video || !mask || video.videoWidth === 0 || video.videoHeight === 0) {
        return;
      }

      const canvases = [previewCanvasRef.current, stageCanvasRef.current];
      const backgroundImage = backgroundImageRef.current;

      canvases.forEach((canvas) => {
        if (!canvas) {
          return;
        }
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return;
        }

        const { videoWidth, videoHeight } = video;

        if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
          canvas.width = videoWidth;
          canvas.height = videoHeight;
        }

        ctx.save();
        ctx.clearRect(0, 0, videoWidth, videoHeight);

        ctx.drawImage(mask, 0, 0, videoWidth, videoHeight);
        ctx.globalCompositeOperation = "source-in";
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

        ctx.globalCompositeOperation = "destination-over";

        if (backgroundImage) {
          ctx.drawImage(backgroundImage, 0, 0, videoWidth, videoHeight);
        } else {
          ctx.fillStyle = "#111827";
          ctx.fillRect(0, 0, videoWidth, videoHeight);
        }

        ctx.restore();
      });

      setHasRenderedVirtualBackgroundFrame(true);
      setIsApplyingVirtualBackground(false);
    },
    []
  );

  useEffect(() => {
    if (!shouldUseVirtualBackground || !isCameraOn || !localStream) {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      isSendingFrameRef.current = false;
      if (segmentationRef.current) {
        segmentationRef.current.close();
        segmentationRef.current = null;
      }
      setIsApplyingVirtualBackground(false);
      return;
    }

    let isCancelled = false;

    const ensureSegmentation = async () => {
      try {
        if (!segmentationRef.current) {
          const module = await import("@mediapipe/selfie_segmentation");
          const segmentation = new module.SelfieSegmentation({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
          }) as SelfieSegmentationInstance;
          segmentation.setOptions({ modelSelection: 1 });
          segmentation.onResults((results) => {
            if (!isCancelled) {
              drawVirtualBackground(results);
            }
          });
          segmentationRef.current = segmentation;
        }

        const processFrame = async () => {
          if (isCancelled || !segmentationRef.current) {
            return;
          }

          const video = previewVideoRef.current;
          if (!video || video.readyState < 2) {
            animationFrameRef.current = window.requestAnimationFrame(processFrame);
            return;
          }

          if (isSendingFrameRef.current) {
            animationFrameRef.current = window.requestAnimationFrame(processFrame);
            return;
          }

          isSendingFrameRef.current = true;
          segmentationRef.current
            .send({ image: video })
            .catch((error) => {
              console.error("Virtual background processing failed", error);
              if (!isCancelled) {
                setVirtualBackgroundError("We couldn't apply the background. Please try again.");
              }
            })
            .finally(() => {
              isSendingFrameRef.current = false;
              if (!isCancelled) {
                animationFrameRef.current = window.requestAnimationFrame(processFrame);
              }
            });
        };

        setIsApplyingVirtualBackground(true);
        animationFrameRef.current = window.requestAnimationFrame(processFrame);
      } catch (error) {
        console.error("Failed to initialize virtual background", error);
        if (!isCancelled) {
          setVirtualBackgroundError("Unable to initialize the background effect. Refresh and try again.");
          setIsApplyingVirtualBackground(false);
        }
      }
    };

    ensureSegmentation();

    return () => {
      isCancelled = true;
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      isSendingFrameRef.current = false;
    };
  }, [shouldUseVirtualBackground, isCameraOn, localStream, drawVirtualBackground]);

  useEffect(() => {
    if (!shouldUseVirtualBackground || !isCameraOn || hasRenderedVirtualBackgroundFrame || virtualBackgroundError) {
      setBackgroundTimeoutExceeded(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setBackgroundTimeoutExceeded(true);
    }, 5000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [shouldUseVirtualBackground, isCameraOn, hasRenderedVirtualBackgroundFrame, virtualBackgroundError, selectedBackground]);

  useEffect(() => {
    if (!isCameraOn) {
      setHasRenderedVirtualBackgroundFrame(false);
      setBackgroundTimeoutExceeded(false);
    }
  }, [isCameraOn]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      if (segmentationRef.current) {
        segmentationRef.current.close();
        segmentationRef.current = null;
      }
      isSendingFrameRef.current = false;
      if (customBackgroundUrlRef.current) {
        URL.revokeObjectURL(customBackgroundUrlRef.current);
        customBackgroundUrlRef.current = null;
      }
    };
  }, []);

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

  const openPanel = (panel: "chat" | "info") => {
    setActivePanel(panel);
    setShowModal(true);
  };

  const closePanel = () => {
    setShowModal(false);
    setActivePanel(null);
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

      const text = chatInput.trim();
      const isWhoBuilt = /who\s+built|who\s+made|kisne\s+banaya|kisne\s+banya|kisne\s+banai/i.test(text);
      if (isWhoBuilt) {
        setChatbotMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: "Athena LMS",
            message: "This chatbot is built by Athena LMS.",
            timestamp: formatTimestamp(),
            source: "bot",
          },
        ]);
      } else {
        const backend = (import.meta as any).env?.VITE_BACKEND_URL ?? "/api";
        fetch(`${backend}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
        })
          .then(async (res) => {
            if (!res.ok) throw new Error("Failed to fetch chatbot response");
            const data = await res.json();
            const content =
              data?.choices?.[0]?.message?.content ??
              data?.data?.choices?.[0]?.message?.content ??
              data?.output_text ??
              "I'm here to help.";
            setChatbotMessages((prev) => [
              ...prev,
              {
                id: `bot-${Date.now()}`,
                sender: "AI Tutor",
                message: content,
                timestamp: formatTimestamp(),
                source: "bot",
              },
            ]);
          })
          .catch(() => {
            setChatbotMessages((prev) => [
              ...prev,
              {
                id: `bot-${Date.now()}`,
                sender: "Athena LMS",
                message: "Sorry, I couldn't connect to the tutor. Powered by Athena LMS.",
                timestamp: formatTimestamp(),
                source: "bot",
              },
            ]);
          });
      }
    }

    setChatInput("");
  };

  const previewContent = (() => {
    if (mediaError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 bg-background/80 text-center">
          <VideoOff className="h-10 w-10 text-destructive" />
          <div className="text-sm font-medium text-destructive">{mediaError}</div>
          <p className="text-xs text-muted-foreground">Check your device settings and refresh to try again.</p>
        </div>
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

    if (!canAccessMedia || !localStream) {
      const message = !canAccessMedia
        ? "Camera access is not supported in this browser or environment."
        : isCameraOn
          ? "Waiting for camera permissions…"
          : "Camera is turned off";
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 bg-background/80 text-center">
          <VideoOff className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      );
    }

    return (
      <div className="relative h-full w-full">
        <video
          ref={previewVideoRef}
          className={`${shouldUseVirtualBackground && !virtualBackgroundError && !backgroundTimeoutExceeded
              ? "hidden"
              : "h-full w-full object-cover"
            }`}
          muted
          playsInline
          autoPlay
        />
        {shouldUseVirtualBackground && !virtualBackgroundError ? (
          <>
            <canvas ref={previewCanvasRef} className="h-full w-full object-cover" />
            {(!hasRenderedVirtualBackgroundFrame || isApplyingVirtualBackground) && !backgroundTimeoutExceeded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-foreground">Applying your background…</p>
              </div>
            )}
          </>
        ) : null}
        {virtualBackgroundError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 p-4 text-center text-sm text-destructive">
            {virtualBackgroundError}
          </div>
        ) : backgroundTimeoutExceeded ? (
          <div className="absolute inset-x-0 bottom-0 flex justify-center p-3">
            <div className="rounded-md bg-background/85 px-3 py-2 text-xs text-muted-foreground shadow">
              Showing your camera without the virtual background while we keep trying to render it.
            </div>
          </div>
        ) : null}
      </div>
    );
  })();

  const backgroundDialog = (
    <Dialog open={isBackgroundModalOpen} onOpenChange={setIsBackgroundModalOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Choose a background</DialogTitle>
          <DialogDescription>Select a preset to appear behind your video preview.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
          <div
            className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-muted"
            style={appliedBackgroundStyle}
          >
            {previewContent}
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Background gallery</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {BACKGROUNDS.map((option) => {
                const isSelected =
                  (option.image === null && selectedBackground === null) ||
                  option.image === selectedBackground;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleBackgroundSelection(option.image)}
                    className={`relative flex h-20 items-end overflow-hidden rounded-lg border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isSelected ? "border-primary ring-2 ring-primary/40" : "border-border"
                      }`}
                    style={
                      option.image
                        ? {
                          backgroundImage: `url(${option.thumbnail ?? option.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                        : { background: "linear-gradient(135deg,#f8fafc,#e2e8f0)" }
                    }
                  >
                    <span className="w-full bg-background/75 px-2 py-1 text-[11px] font-medium text-foreground">
                      {option.label}
                    </span>
                    {isSelected && (
                      <span className="absolute left-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                );
              })}
              {customBackground ? (
                <button
                  key="custom"
                  type="button"
                  onClick={() => handleBackgroundSelection(customBackground)}
                  className={`relative flex h-20 items-end overflow-hidden rounded-lg border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selectedBackground === customBackground ? "border-primary ring-2 ring-primary/40" : "border-border"
                    }`}
                  style={{
                    backgroundImage: `url(${customBackground})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <span className="w-full bg-background/75 px-2 py-1 text-[11px] font-medium text-foreground">
                    My Upload
                  </span>
                  {selectedBackground === customBackground && (
                    <span className="absolute left-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              ) : null}
            </div>
            <div className="space-y-2">
              <Button type="button" variant="outline" className="w-full gap-2" onClick={handleOpenBackgroundUpload}>
                <Upload className="h-4 w-4" />
                Upload background image
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCustomBackgroundChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (!isJoined) {
    return (
      <>
        <Card className="overflow-hidden border border-border">
          <div className="grid gap-6 p-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              <div
                className="relative mx-auto aspect-video w-full max-w-4xl overflow-hidden rounded-[28px] border border-border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-2xl"
                style={appliedBackgroundStyle}
              >
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
                  <Button
                    variant={isCameraOn ? "secondary" : "destructive"}
                    className="gap-2"
                    onClick={() => setIsCameraOn((prev) => !prev)}
                  >
                    {isCameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    {isCameraOn ? "Stop Video" : "Turn Video On"}
                  </Button>
                </div>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-4 right-4 rounded-full border border-border bg-background/85 text-foreground shadow backdrop-blur transition hover:bg-background"
                  onClick={() => setIsBackgroundModalOpen(true)}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>

              <div className="rounded-xl border border-border bg-muted/50 p-4 text-sm">
                <p className="font-semibold text-foreground">Preview your setup</p>
                <p className="text-muted-foreground">
                  Toggle your microphone and camera before joining. You can update these settings once you are inside the
                  live classroom as well.
                </p>
              </div>
            </div>

            <div className="space-y-4">
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
        {backgroundDialog}
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-900 text-neutral-50">
      <main className="relative flex flex-1 overflow-hidden">
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative flex flex-1 overflow-hidden bg-black"
        >
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src="https://lesson-banners.s3.us-east-1.amazonaws.com/Scorms/3a98d3a3-efc5-461d-9b60-7a1febc71947.mp4"
            autoPlay
            loop
            muted
            playsInline
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

          <div className="absolute inset-0 flex flex-col justify-between">
            <div className="flex flex-col gap-3 p-6 text-sm text-white">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-lg">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                  </span>
                  Live
                </div>

              </div>

              <div >



              </div>
            </div>

            <div className="flex flex-1 items-end justify-between px-6 pb-4">
              {mediaError ? (
                <div className="rounded-2xl border border-destructive/40 bg-destructive/20 px-4 py-3 text-sm text-white shadow-lg backdrop-blur">
                  {mediaError}
                </div>
              ) : (
                <div />
              )}

              {isCameraOn && localStream ? (
                <div className="h-32 w-32 overflow-hidden rounded-2xl border border-white/20 bg-black/80 shadow-2xl backdrop-blur">
                  <video ref={stageVideoRef} className="h-full w-full object-cover" muted playsInline autoPlay />
                </div>
              ) : null}
            </div>

            <div className="border-t border-white/10 bg-neutral-900/95 px-6 py-2">
              {showCaptions && (
                <div className="mx-auto mb-3 max-w-xl rounded-full bg-black/70 px-5 py-2 text-center text-xs font-medium text-white shadow-lg backdrop-blur">
                  {currentCaption}
                </div>
              )}

              <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2 text-xs">
                <Button
                  variant="secondary"
                  className={`flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-white hover:bg-white/20 ${activePanel === "chat" && showModal ? "!bg-white/25" : ""
                    }`}
                  onClick={() =>
                    showModal && activePanel === "chat" ? closePanel() : openPanel("chat")
                  }
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </Button>

                <Button
                  variant={isMicOn ? "secondary" : "destructive"}
                  size="icon"
                  className="h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20"
                  onClick={() => setIsMicOn((prev) => !prev)}
                >
                  {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>

                <Button
                  variant="secondary"
                  size="icon"
                  className={`h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 ${showCaptions ? "!bg-white/30" : ""}`}
                  onClick={() => setShowCaptions((prev) => !prev)}
                >
                  <CaptionsIcon className="h-5 w-5" />
                </Button>

                <Button
                  variant="secondary"
                  size="icon"
                  className={`h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 ${activePanel === "info" && showModal ? "!bg-white/30" : ""
                    }`}
                  onClick={() =>
                    showModal && activePanel === "info" ? closePanel() : openPanel("info")
                  }
                >
                  <Info className="h-5 w-5" />
                </Button>

                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <Hand className="h-5 w-5" />
                </Button>

                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <Smile className="h-5 w-5" />
                </Button>

                <Button
                  variant="destructive"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-red-600 text-white hover:bg-red-500"
                  onClick={handleLeaveSession}
                >
                  <PhoneOff className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </motion.section>

        <AnimatePresence>
          {showModal && activePanel ? (
            <motion.aside
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative z-40 h-full w-full max-w-sm border-l border-white/10 bg-neutral-900/95 text-neutral-100 backdrop-blur"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <h3 className="text-base font-semibold">
                    {activePanel === "chat" ? "Collaboration" : "Meeting info"}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {activePanel === "chat" ? "Chat, AI tutor, and resources" : "Share details with participants"}
                  </p>
                </div>
                <Button size="sm" variant="ghost" className="rounded-full px-3 text-neutral-300 hover:bg-white/10" onClick={closePanel}>
                  Close
                </Button>
              </div>

              {activePanel === "chat" ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-[calc(100%-4.5rem)] flex-col overflow-hidden px-5 py-4">
                  <TabsList className="flex-shrink-0 grid grid-cols-3 rounded-full bg-white/10 p-1 text-xs">
                    <TabsTrigger value="session-chat" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-neutral-900">
                      Session
                    </TabsTrigger>
                    <TabsTrigger value="chatbot" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-neutral-900">
                      AI Tutor
                    </TabsTrigger>
                    <TabsTrigger value="resources" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-neutral-900">
                      Resources
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-4 flex-1 min-h-0 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-inner">
                    <TabsContent value="session-chat" className="h-full">
                      <ScrollArea className="h-full px-4 py-4 overflow-y-auto">
                        <div className="flex h-full flex-col-reverse gap-4">
                          {[...sessionChat].map((message) => (
                            <div key={message.id} className={`flex ${message.source === "participant" ? "justify-end" : "justify-start"}`}>
                              <div
                                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${message.source === "participant"
                                    ? "bg-primary/90 text-primary-foreground shadow-md"
                                    : message.source === "instructor"
                                      ? "bg-neutral-800 text-white shadow-sm"
                                      : "bg-neutral-700 text-white"
                                  }`}
                              >
                                <p className="font-medium">{message.sender}</p>
                                <p>{message.message}</p>
                                <p className="mt-1 text-[10px] uppercase tracking-wide text-white/70">{message.timestamp}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="chatbot" className="h-full">
                      <ScrollArea className="h-full px-1 py-1 overflow-y-auto">
                        <div className="flex h-full flex-col-reverse gap-4">
                          {[...chatbotMessages].map((message) => (
                            <div key={message.id} className={`flex ${message.source === "participant" ? "justify-end" : "justify-start"}`}>
                              <div
                                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${message.source === "participant"
                                    ? "bg-primary/90 text-primary-foreground shadow-md"
                                    : "bg-neutral-700 text-white"
                                  }`}
                              >
                                <p className="flex items-center gap-2 font-medium">
                                  {message.source === "bot" && <Bot className="h-3 w-3" />}
                                  {message.sender}
                                </p>
                                <p>{message.message}</p>
                                <p className="mt-1 text-[10px] uppercase tracking-wide text-white/70">{message.timestamp}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="resources" className="h-full">
                      <div className="flex h-full flex-col gap-3 px-5 py-4 text-sm overflow-y-auto">
                        <div>
                          <p className="font-medium text-white">Lesson Materials</p>
                          <p className="text-neutral-400">Slides, worksheets, and recordings will appear here.</p>
                        </div>
                        <ul className="list-inside list-disc space-y-1 text-neutral-400">
                          <li>Interactive whiteboard snapshots</li>
                          <li>Recommended follow-up practice</li>
                          <li>Session transcript (auto-generated)</li>
                        </ul>
                      </div>
                    </TabsContent>
                  </div>

                  <div className="sticky bottom-0 bg-neutral-900 mt-4 flex-shrink-0 rounded-2xl border border-white/10 px-4 py-4 shadow-lg">
                    <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
                      <Textarea
                        placeholder={
                          activeTab === "chatbot" ? "Ask the AI tutor a quick question..." : "Share an update or ask the group something..."
                        }
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        rows={3}
                        className="h-20 resize-none overflow-y-auto bg-neutral-950/70 text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <div className="flex items-center justify-between text-xs text-neutral-400">
                        <span>{displayName || "You"} {isMicOn ? "(mic on)" : "(mic muted)"}</span>
                        <Button type="submit" size="sm" className="gap-2 rounded-full bg-primary px-4 text-white hover:bg-primary/90">
                          <MessageSquare className="h-4 w-4" />
                          Send
                        </Button>
                      </div>
                    </form>
                  </div>
                </Tabs>
              ) : (
                <div className="flex h-[calc(100%-4.5rem)] flex-col overflow-hidden px-5 py-4 text-sm text-neutral-100">
                  <div className="rounded-2xl border border-white/10 bg-neutral-900 px-5 py-4 shadow-inner">
                    <h4 className="text-base font-semibold">Meeting details</h4>
                    <p className="mt-2 text-xs text-neutral-400">Share these details with anyone who needs to join.</p>
                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between rounded-2xl bg-neutral-800/80 px-4 py-3">
                        <span className="font-semibold text-neutral-100">Course</span>
                        <span className="text-neutral-300">{courseTitle}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-neutral-800/80 px-4 py-3">
                        <span className="font-semibold text-neutral-100">Elapsed</span>
                        <span className="text-neutral-300">00:12</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl bg-neutral-800/80 px-4 py-3">
                        <span className="font-semibold text-neutral-100">Meeting ID</span>
                        <span className="text-neutral-300">{sessionId ?? "Shared link"}</span>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      className="mt-4 w-full justify-center rounded-full bg-white/10 px-4 py-2 text-white hover:bg-white/20"
                      onClick={handleCopyLink}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Copy invite link
                    </Button>
                  </div>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-neutral-900 px-5 py-4 shadow-inner">
                    <h4 className="text-base font-semibold">Participants overview</h4>
                    <p className="mt-2 text-xs text-neutral-400">
                      {participantCount}+ learners connected. Use the chat to collaborate in real-time.
                    </p>
                  </div>
                </div>
              )}
            </motion.aside>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default SessionMeetingExperience;
