import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, MessageSquare, Settings, Maximize2 } from "lucide-react";
import { useState } from "react";
import avatarIcon from "@/assets/avatar-icon.png";

const VirtualInstructorSession = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSessionActive, setIsSessionActive] = useState(false);

  return (
    <div className="space-y-4">
      {/* Video Area */}
      <Card className="relative aspect-video bg-gradient-to-br from-primary/5 to-background border-2 overflow-hidden">
        {isSessionActive ? (
          <div className="w-full h-full">
            <video 
              autoPlay
              controls 
              className="w-full h-full object-cover"
              src="https://lesson-banners.s3.us-east-1.amazonaws.com/Scorms/3a98d3a3-efc5-461d-9b60-7a1febc71947.mp4"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Video className="h-12 w-12 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Session Ready</h3>
                <p className="text-muted-foreground">Click "Start Session" to begin your virtual instructor session</p>
              </div>
            </div>
          </div>
        )}

        {/* Top Right Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button size="icon" variant="secondary" className="bg-background/80 backdrop-blur-sm">
            <Settings className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" className="bg-background/80 backdrop-blur-sm">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Session Info Overlay */}
        {isSessionActive && (
          <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Live Session</span>
            </div>
          </div>
        )}
      </Card>

      {/* Control Panel */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              size="lg"
              variant={isSessionActive ? "destructive" : "default"}
              onClick={() => setIsSessionActive(!isSessionActive)}
            >
              {isSessionActive ? "End Session" : "Start Session"}
            </Button>
            
            <div className="flex gap-2">
              <Button
                size="icon"
                variant={isMuted ? "destructive" : "secondary"}
                onClick={() => setIsMuted(!isMuted)}
                disabled={!isSessionActive}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              
              <Button
                size="icon"
                variant={!isVideoOn ? "destructive" : "secondary"}
                onClick={() => setIsVideoOn(!isVideoOn)}
                disabled={!isSessionActive}
              >
                {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>Real-time Q&A Available</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VirtualInstructorSession;
