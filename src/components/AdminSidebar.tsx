import { Video, Users, BookOpen, BarChart, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface AdminSidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const AdminSidebar = ({ activeView, setActiveView }: AdminSidebarProps) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: "sessions", label: "Manage Sessions", icon: Video },
    { id: "students", label: "Manage Students", icon: Users },
    { id: "courses", label: "Manage Courses", icon: BookOpen },
    { id: "analytics", label: "Analytics", icon: BarChart },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                isActive && "bg-primary/10 text-primary hover:bg-primary/20"
              )}
              onClick={() => setActiveView(item.id)}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Button>
          );
        })}
        
        <div className="pt-4 mt-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={() => navigate("/")}
          >
            <Users className="h-5 w-5" />
            Switch to Student View
          </Button>
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Admin User</p>
            <p className="text-xs text-muted-foreground truncate">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
