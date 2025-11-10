import Sidebar from "@/components/Sidebar";
import VirtualInstructorSession from "@/components/VirtualInstructorSession";
import SessionInfo from "@/components/SessionInfo";
import ChatPanel from "@/components/ChatPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Virtual Instructor</h1>
            <p className="text-muted-foreground">
              Experience interactive learning with AI-powered virtual instructors
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <VirtualInstructorSession />
              <SessionInfo />
            </div>
            
            <div className="lg:col-span-1">
              <ChatPanel />
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">My Sessions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { course: "Advanced Mathematics", instructor: "Professional Male", status: "Active", students: 24 },
                { course: "Physics 101", instructor: "Scientist", status: "Scheduled", students: 18 },
                { course: "Chemistry Basics", instructor: "Teacher", status: "Completed", students: 32 },
              ].map((session, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{session.course}</CardTitle>
                      <Badge variant={session.status === "Active" ? "default" : session.status === "Scheduled" ? "secondary" : "outline"}>
                        {session.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Instructor:</span>
                        <span>{session.instructor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Students:</span>
                        <span>{session.students}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
