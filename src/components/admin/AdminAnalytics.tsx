import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Video, BookOpen } from "lucide-react";

const AdminAnalytics = () => {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Virtual instructor performance metrics</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-foreground">1,247</div>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
              </div>
              <Video className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2 flex items-center text-xs text-green-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-foreground">247</div>
                <p className="text-sm text-muted-foreground">Active Students</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2 flex items-center text-xs text-green-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-foreground">42</div>
                <p className="text-sm text-muted-foreground">Active Courses</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2 flex items-center text-xs text-green-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-foreground">92%</div>
                <p className="text-sm text-muted-foreground">Avg Attendance</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-2 flex items-center text-xs text-green-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              +3% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Session Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Questions Asked</span>
                  <span className="font-semibold text-foreground">3,456</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "85%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">AI Response Rate</span>
                  <span className="font-semibold text-foreground">98%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "98%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Student Satisfaction</span>
                  <span className="font-semibold text-foreground">4.6/5</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "92%" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Advanced Mathematics", students: 45, rating: 4.8 },
                { name: "Chemistry Basics", students: 52, rating: 4.7 },
                { name: "Physics 101", students: 38, rating: 4.6 },
              ].map((course, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">{course.name}</p>
                    <p className="text-sm text-muted-foreground">{course.students} students</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">{course.rating}</div>
                    <div className="text-xs text-muted-foreground">rating</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
