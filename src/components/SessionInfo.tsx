import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, BookOpen } from "lucide-react";

const SessionInfo = () => {
  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Introduction to React Hooks</h2>
        <p className="text-muted-foreground">Computer Science • CS301</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Badge variant="secondary" className="gap-2">
          <Clock className="h-3 w-3" />
          45 minutes
        </Badge>
        <Badge variant="secondary" className="gap-2">
          <Users className="h-3 w-3" />
          Interactive Session
        </Badge>
        <Badge variant="secondary" className="gap-2">
          <BookOpen className="h-3 w-3" />
          Intermediate Level
        </Badge>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Session Overview</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Understanding useState and useEffect hooks</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Custom hooks creation and best practices</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Real-world examples and live coding</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Q&A with AI-powered virtual instructor</span>
          </li>
        </ul>
      </div>
    </Card>
  );
};

export default SessionInfo;
