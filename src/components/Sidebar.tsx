import { Home, BookOpen, Users, Calendar, BarChart, Settings, Video, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("virtual-instructor");

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "courses", label: "My Courses", icon: BookOpen },
    { id: "virtual-instructor", label: "Virtual Instructor", icon: Video },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">LMSAthena</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive && "bg-primary/10 text-primary hover:bg-primary/20"
                )}
                onClick={() => setActiveItem(item.id)}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </div>

        <div className="mt-auto rounded-xl border border-border bg-muted/40 p-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={() => navigate("/admin")}
          >
            <Shield className="h-5 w-5" />
            Switch to Admin View
          </Button>
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Ankit Kumar</p>
            <p className="text-xs text-muted-foreground truncate">Student</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
