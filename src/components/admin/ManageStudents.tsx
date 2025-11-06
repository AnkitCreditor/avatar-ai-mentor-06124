import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Mail, BarChart3 } from "lucide-react";
import { useState } from "react";

const ManageStudents = () => {
  const [students] = useState([
    { id: 1, name: "Alice Johnson", email: "alice@example.com", courses: 5, sessions: 12, attendance: 95 },
    { id: 2, name: "Bob Smith", email: "bob@example.com", courses: 3, sessions: 8, attendance: 88 },
    { id: 3, name: "Carol Davis", email: "carol@example.com", courses: 4, sessions: 10, attendance: 92 },
    { id: 4, name: "David Wilson", email: "david@example.com", courses: 6, sessions: 15, attendance: 78 },
  ]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Students</h1>
          <p className="text-muted-foreground">View and manage student enrollments</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Student
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or email..." className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">247</div>
            <p className="text-sm text-muted-foreground">Total Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">189</div>
            <p className="text-sm text-muted-foreground">Active This Month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">92%</div>
            <p className="text-sm text-muted-foreground">Avg Attendance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">4.2</div>
            <p className="text-sm text-muted-foreground">Avg Courses/Student</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {students.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{student.name}</h3>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-foreground">{student.courses}</div>
                    <div className="text-xs text-muted-foreground">Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-foreground">{student.sessions}</div>
                    <div className="text-xs text-muted-foreground">Sessions</div>
                  </div>
                  <Badge variant={student.attendance >= 90 ? "default" : "secondary"}>
                    {student.attendance}% Attendance
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-4 w-4" />
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

export default ManageStudents;
