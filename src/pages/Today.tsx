
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { useTask } from "@/contexts/TaskContext";
import { Plus, Calendar, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Today() {
  const { spaces } = useTask();
  const allTasks = spaces.flatMap(space => space.tasks);
  const todayTasks = allTasks.filter(task => task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString());

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Today's Tasks</h1>
            <p className="text-gray-500 mt-1">Focus on what matters today</p>
          </div>
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Todo
          </Button>
        </div>

        <div className="grid gap-4 mb-20">
          {todayTasks.map((task) => (
            <Card key={task.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    className={`w-5 h-5 rounded-full border-2 ${
                      task.completed
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300"
                    }`}
                  />
                  <span className={task.completed ? "line-through text-gray-500" : ""}>
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Today</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Navigation />
      </div>
    </div>
  );
}
