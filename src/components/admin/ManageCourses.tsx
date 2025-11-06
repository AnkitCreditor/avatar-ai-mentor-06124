import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { useState } from "react";

const ManageCourses = () => {
  const [courses] = useState([
    { id: 1, name: "Advanced Mathematics", instructor: "AI Instructor", students: 45, sessions: 12, status: "Active" },
    { id: 2, name: "Physics 101", instructor: "AI Instructor", students: 38, sessions: 10, status: "Active" },
    { id: 3, name: "Chemistry Basics", instructor: "AI Instructor", students: 52, sessions: 8, status: "Active" },
    { id: 4, name: "Biology Fundamentals", instructor: "AI Instructor", students: 41, sessions: 0, status: "Draft" },
  ]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manage Courses</h1>
          <p className="text-muted-foreground">Create and manage virtual instructor courses</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Course
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Course</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="courseName">Course Name</Label>
            <Input id="courseName" placeholder="Enter course name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Enter course description" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" placeholder="e.g., Science, Math" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Input id="level" placeholder="e.g., Beginner, Advanced" />
            </div>
          </div>
          <Button className="w-full">Create Course</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Course List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">{course.name}</h3>
                    <Badge variant={course.status === "Active" ? "default" : "secondary"}>
                      {course.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course.students} students
                    </span>
                    <span>•</span>
                    <span>{course.sessions} sessions</span>
                    <span>•</span>
                    <span>{course.instructor}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageCourses;
