import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Pause, Trash2, Edit } from "lucide-react";
import { useState } from "react";

const ManageSessions = () => {
  const [sessions] = useState([
    { id: 1, course: "Advanced Mathematics", instructor: "AI Instructor", status: "Active", students: 24, duration: "1h 20m" },
    { id: 2, course: "Physics 101", instructor: "AI Instructor", status: "Scheduled", students: 18, duration: "Not started" },
    { id: 3, course: "Chemistry Basics", instructor: "AI Instructor", status: "Completed", students: 32, duration: "1h 45m" },
  ]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Virtual Instructor Sessions</h1>
          <p className="text-muted-foreground">Create and control AI instructor sessions</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Session
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Session Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">Course Name</Label>
              <Input id="course" placeholder="Enter course name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input id="topic" placeholder="Enter session topic" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule</Label>
              <Input id="schedule" type="datetime-local" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input id="duration" type="number" placeholder="60" />
            </div>
          </div>
          <Button className="w-full">Schedule Session</Button>
        </CardContent>
      </Card>

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
