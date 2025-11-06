import AdminSidebar from "@/components/AdminSidebar";
import ManageSessions from "@/components/admin/ManageSessions";
import ManageStudents from "@/components/admin/ManageStudents";
import ManageCourses from "@/components/admin/ManageCourses";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import { useState } from "react";

const Admin = () => {
  const [activeView, setActiveView] = useState("sessions");

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

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 ml-64 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default Admin;
