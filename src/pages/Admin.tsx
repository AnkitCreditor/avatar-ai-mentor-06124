import AdminSidebar from "@/components/AdminSidebar";
import ManageSessions from "@/components/admin/ManageSessions";
import ManageStudents from "@/components/admin/ManageStudents";
import ManageCourses from "@/components/admin/ManageCourses";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";

const Admin = () => {
  const [activeView, setActiveView] = useState("sessions");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeView) {
      case "sessions":
        return <ManageSessions />;
      case "students":
        return <ManageStudents />;
      case "courses":
        return <ManageCourses />;
      case "analytics":
        return <AdminAnalytics />;
      default:
        return <ManageSessions />;
    }
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <AdminSidebar activeView={activeView} setActiveView={setActiveView} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 left-4 z-50 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <AdminSidebar activeView={activeView} setActiveView={handleViewChange} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 w-full lg:ml-64 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default Admin;
