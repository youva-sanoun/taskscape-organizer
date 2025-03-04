import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { useTask } from "@/contexts/TaskContext";
import { Plus, Calendar, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function Tasks() {
  const { spaces, createTask, toggleTaskCompletion } = useTask();
  const [newTaskData, setNewTaskData] = useState({
    title: "",
    description: "",
    dueDate: ""
  });
  const [isOpen, setIsOpen] = useState(false);

  const allTasks = spaces.flatMap(space => space.tasks);

  const handleCreateTask = () => {
    if (newTaskData.title.trim()) {
      // Create task without a spaceId for global tasks
      createTask("", newTaskData.title, newTaskData.description, newTaskData.dueDate ? new Date(newTaskData.dueDate) : undefined);
      setNewTaskData({ title: "", description: "", dueDate: "" });
      setIsOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Tasks</h1>
            <p className="text-gray-500 mt-1">View and manage all your tasks</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Todo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Task title"
                  value={newTaskData.title}
                  onChange={(e) => setNewTaskData(prev => ({ ...prev, title: e.target.value }))}
                />
                <Textarea
                  placeholder="Task description (optional)"
                  value={newTaskData.description}
                  onChange={(e) => setNewTaskData(prev => ({ ...prev, description: e.target.value }))}
                />
                <Input
                  type="date"
                  value={newTaskData.dueDate}
                  onChange={(e) => setNewTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
                <Button onClick={handleCreateTask} className="w-full">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 mb-20">
          {allTasks.map((task) => (
            <Card key={task.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTaskCompletion(task.spaceId, task.id)}
                    className={`w-5 h-5 rounded-full border-2 ${
                      task.completed
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300"
                    }`}
                  />
                  <div className="flex flex-col">
                    <span className={task.completed ? "line-through text-gray-500" : ""}>
                      {task.title}
                    </span>
                    {task.description && (
                      <span className="text-sm text-gray-500">{task.description}</span>
                    )}
                  </div>
                </div>
                {task.dueDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        <Navigation />
      </div>
    </div>
  );
}
