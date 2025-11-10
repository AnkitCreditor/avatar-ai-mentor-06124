import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Play, Pause, Trash2, Edit, User, Mic, Volume2, FileText, Settings, Download, Briefcase, UserSquare, Smile, FlaskConical, GraduationCap, Scale, Radio, BookOpen, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const AVATARS = [
  { id: "professional-male", name: "Professional Male", description: "Formal business attire", icon: Briefcase },
  { id: "professional-female", name: "Professional Female", description: "Formal business attire", icon: UserSquare },
  { id: "casual-male", name: "Casual Male", description: "Friendly and approachable", icon: Smile },
  { id: "casual-female", name: "Casual Female", description: "Friendly and approachable", icon: User },
  { id: "scientist", name: "Scientist", description: "Lab coat and glasses", icon: FlaskConical },
  { id: "teacher", name: "Teacher", description: "Academic setting", icon: GraduationCap },
];

const VOICES = [
  { id: "alloy", name: "Alloy", description: "Neutral and balanced", icon: Scale },
  { id: "echo", name: "Echo", description: "Clear and articulate", icon: Radio },
  { id: "fable", name: "Fable", description: "Warm and engaging", icon: BookOpen },
  { id: "onyx", name: "Onyx", description: "Deep and authoritative", icon: Volume2 },
  { id: "nova", name: "Nova", description: "Energetic and friendly", icon: Zap },
  { id: "shimmer", name: "Shimmer", description: "Soft and calm", icon: Sparkles },
];

interface InstructorConfig {
  avatar: string;
  voice: string;
  courseName: string;
  topic: string;
  schedule: string;
  duration: string;
  content: string;
  systemPrompt: string;
  language: string;
}

const ManageSessions = () => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState([
    { id: 1, course: "Advanced Mathematics", instructor: "AI Instructor", status: "Active", students: 24, duration: "1h 20m", config: null },
    { id: 2, course: "Physics 101", instructor: "AI Instructor", status: "Scheduled", students: 18, duration: "Not started", config: null },
    { id: 3, course: "Chemistry Basics", instructor: "AI Instructor", status: "Completed", students: 32, duration: "1h 45m", config: null },
  ]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [videoQuality, setVideoQuality] = useState("720p");
  const [instructorConfig, setInstructorConfig] = useState<InstructorConfig>({
    avatar: "",
    voice: "",
    courseName: "",
    topic: "",
    schedule: "",
    duration: "60",
    content: "",
    systemPrompt: "You are a knowledgeable and patient AI instructor. Help students understand the material through clear explanations and examples.",
    language: "en",
  });

  const handleCreateSession = () => {
    if (!instructorConfig.avatar || !instructorConfig.voice || !instructorConfig.courseName) {
      toast({
        title: "Missing Information",
        description: "Please fill in avatar, voice, and course name",
        variant: "destructive",
      });
      return;
    }

    const newSession = {
      id: sessions.length + 1,
      course: instructorConfig.courseName,
      instructor: `AI Instructor (${AVATARS.find(a => a.id === instructorConfig.avatar)?.name})`,
      status: "Scheduled",
      students: 0,
      duration: "Not started",
      config: { ...instructorConfig },
    };

    setSessions([...sessions, newSession]);
    setIsDialogOpen(false);
    setInstructorConfig({
      avatar: "",
      voice: "",
      courseName: "",
      topic: "",
      schedule: "",
      duration: "60",
      content: "",
      systemPrompt: "You are a knowledgeable and patient AI instructor. Help students understand the material through clear explanations and examples.",
      language: "en",
    });

    toast({
      title: "Session Created",
      description: `Virtual instructor session for ${instructorConfig.courseName} has been created`,
    });
  };

  const handleExportVideo = () => {
    // Simulate video export
    const link = document.createElement('a');
    link.href = 'https://www.w3schools.com/html/mov_bbb.mp4'; // Dummy video
    link.download = `instructor-session-${videoQuality}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsExportDialogOpen(false);
    toast({
      title: "Export Started",
      description: `Exporting video in ${videoQuality} quality`,
    });
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Virtual Instructor Sessions</h1>
          <p className="text-muted-foreground">Create and control AI instructor sessions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Virtual Instructor</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Avatar Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <Label className="text-lg font-semibold">Choose Avatar Character</Label>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {AVATARS.map((avatar) => {
                    const IconComponent = avatar.icon;
                    return (
                      <button
                        key={avatar.id}
                        onClick={() => setInstructorConfig({ ...instructorConfig, avatar: avatar.id })}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          instructorConfig.avatar === avatar.id
                            ? "border-primary bg-secondary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2 mb-2">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <IconComponent className="h-8 w-8 text-primary" />
                          </div>
                        </div>
                        <div className="font-semibold text-foreground text-center">{avatar.name}</div>
                        <div className="text-sm text-muted-foreground text-center">{avatar.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Voice Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-primary" />
                  <Label className="text-lg font-semibold">Voice Configuration</Label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {VOICES.map((voice) => {
                    const IconComponent = voice.icon;
                    return (
                      <button
                        key={voice.id}
                        onClick={() => setInstructorConfig({ ...instructorConfig, voice: voice.id })}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          instructorConfig.voice === voice.id
                            ? "border-primary bg-secondary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div className="font-semibold text-foreground">{voice.name}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">{voice.description}</div>
                      </button>
                    );
                  })}
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={instructorConfig.language} onValueChange={(value) => setInstructorConfig({ ...instructorConfig, language: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Course Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <Label className="text-lg font-semibold">Course Details</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="course">Course Name *</Label>
                    <Input 
                      id="course" 
                      placeholder="e.g., Advanced Mathematics" 
                      value={instructorConfig.courseName}
                      onChange={(e) => setInstructorConfig({ ...instructorConfig, courseName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Input 
                      id="topic" 
                      placeholder="e.g., Linear Algebra" 
                      value={instructorConfig.topic}
                      onChange={(e) => setInstructorConfig({ ...instructorConfig, topic: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schedule">Schedule</Label>
                    <Input 
                      id="schedule" 
                      type="datetime-local" 
                      value={instructorConfig.schedule}
                      onChange={(e) => setInstructorConfig({ ...instructorConfig, schedule: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input 
                      id="duration" 
                      type="number" 
                      placeholder="60" 
                      value={instructorConfig.duration}
                      onChange={(e) => setInstructorConfig({ ...instructorConfig, duration: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Content & Instructions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <Label className="text-lg font-semibold">Content & Instructions</Label>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="content">Course Content & Materials</Label>
                    <Textarea 
                      id="content"
                      placeholder="Provide the course content, learning objectives, key concepts, and any materials the AI instructor should cover..."
                      className="min-h-[120px]"
                      value={instructorConfig.content}
                      onChange={(e) => setInstructorConfig({ ...instructorConfig, content: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="systemPrompt">AI Instructor System Prompt</Label>
                    <Textarea 
                      id="systemPrompt"
                      placeholder="Define how the AI instructor should behave, its teaching style, personality..."
                      className="min-h-[100px]"
                      value={instructorConfig.systemPrompt}
                      onChange={(e) => setInstructorConfig({ ...instructorConfig, systemPrompt: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button onClick={handleCreateSession} className="w-full">
                  Create Virtual Instructor Session
                </Button>
                <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full gap-2">
                      <Download className="h-4 w-4" />
                      Export Video
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Export Video</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <p className="text-sm text-muted-foreground">
                        Choose video quality to export
                      </p>
                      <RadioGroup value={videoQuality} onValueChange={setVideoQuality}>
                        <div className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                          <RadioGroupItem value="480p" id="480p" />
                          <Label htmlFor="480p" className="flex-1 cursor-pointer">480p (SD)</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                          <RadioGroupItem value="720p" id="720p" />
                          <Label htmlFor="720p" className="flex-1 cursor-pointer">720p (HD)</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                          <RadioGroupItem value="1080p" id="1080p" />
                          <Label htmlFor="1080p" className="flex-1 cursor-pointer">1080p (Full HD)</Label>
                        </div>
                      </RadioGroup>
                      <Button onClick={handleExportVideo} className="w-full gap-2">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>


      <Card>
        <CardHeader>
          <CardTitle>Active & Scheduled Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">{session.course}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{session.instructor}</span>
                    <span>•</span>
                    <span>{session.students} students</span>
                    <span>•</span>
                    <span>{session.duration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={session.status === "Active" ? "default" : session.status === "Scheduled" ? "secondary" : "outline"}>
                    {session.status}
                  </Badge>
                  <div className="flex gap-2">
                    {session.status === "Active" && (
                      <Button size="sm" variant="outline">
                        <Pause className="h-4 w-4" />
                      </Button>
                    )}
                    {session.status === "Scheduled" && (
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageSessions;
