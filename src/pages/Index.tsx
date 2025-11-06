import Sidebar from "@/components/Sidebar";
import VirtualInstructorSession from "@/components/VirtualInstructorSession";
import SessionInfo from "@/components/SessionInfo";
import ChatPanel from "@/components/ChatPanel";

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
        </div>
      </main>
    </div>
  );
};

export default Index;
