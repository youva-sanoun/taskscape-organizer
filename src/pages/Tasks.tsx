import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { useTask } from "@/contexts/TaskContext";
import { Task } from "@/types";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useMemo } from "react";
import { TaskCard } from "@/components/TaskCard";
import { useNavigate } from "react-router-dom";

interface TaskWithLocation extends Task {
  spaceName: string;
  subspaceName?: string;
  fromSubspace?: boolean;
  subspaceId?: string;
}

export default function Tasks() {
  const { spaces, createTask, toggleTaskCompletion, deleteTask, updateTask } =
    useTask();

  const [newTaskData, setNewTaskData] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Get all tasks from all spaces and subspaces with location info
  const allTasks = useMemo(() => {
    const tasks: TaskWithLocation[] = [];

    // Tasks from main spaces
    spaces.forEach((space) => {
      tasks.push(
        ...space.tasks.map((task) => ({
          ...task,
          spaceName: space.name,
        }))
      );

      // Tasks from subspaces
      space.subspaces.forEach((subspace) => {
        tasks.push(
          ...subspace.tasks.map((task) => ({
            ...task,
            spaceName: space.name,
            subspaceName: subspace.name,
            fromSubspace: true,
            subspaceId: subspace.id,
          }))
        );
      });
    });

    return tasks;
  }, [spaces]);

  const handleCreateTask = () => {
    if (newTaskData.title.trim()) {
      createTask(
        "",
        newTaskData.title,
        newTaskData.description,
        newTaskData.dueDate ? new Date(newTaskData.dueDate) : undefined
      );
      setNewTaskData({ title: "", description: "", dueDate: "" });
      setIsOpen(false);
    }
  };

  const handleTaskClick = (task: TaskWithLocation) => {
    if (task.fromSubspace) {
      navigate(`/task/${task.spaceId}/${task.id}?subspace=${task.subspaceId}`);
    } else {
      navigate(`/task/${task.spaceId}/${task.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              All Tasks
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              View and manage all your tasks
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Todo
                </Button>
              </DialogTrigger>
              <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="dark:text-white">
                    Create New Task
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Task title"
                    value={newTaskData.title}
                    onChange={(e) =>
                      setNewTaskData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  />
                  <Textarea
                    placeholder="Task description (optional)"
                    value={newTaskData.description}
                    onChange={(e) =>
                      setNewTaskData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  />
                  <Input
                    type="date"
                    value={newTaskData.dueDate}
                    onChange={(e) =>
                      setNewTaskData((prev) => ({
                        ...prev,
                        dueDate: e.target.value,
                      }))
                    }
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <Button
                    onClick={handleCreateTask}
                    className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    Create Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 mb-20">
          {allTasks.map((task) => (
            <div
              key={`${task.spaceId}-${task.subspaceId || ""}-${task.id}`}
              onClick={(e) => {
                // Prevent event bubbling if clicking on controls inside the card
                if ((e.target as HTMLElement).closest("button")) {
                  return;
                }
                handleTaskClick(task);
              }}
              className="cursor-pointer transition-transform hover:translate-y-[-2px]"
            >
              <div className="relative">
                {task.subspaceName && (
                  <div className="absolute -top-3 left-3 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full z-10">
                    {task.subspaceName}
                  </div>
                )}
                <TaskCard
                  task={task}
                  onToggle={(id) => {
                    // Stop event propagation to prevent navigation
                    toggleTaskCompletion(task.spaceId, id, task.subspaceId);
                  }}
                  onEdit={(updates) => {
                    // Stop event propagation to prevent navigation
                    updateTask(task.spaceId, task.id, updates, task.subspaceId);
                  }}
                  onDelete={() => {
                    // Stop event propagation to prevent navigation
                    deleteTask(task.spaceId, task.id, task.subspaceId);
                  }}
                />
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex justify-end">
                  In {task.spaceName}
                </div>
              </div>
            </div>
          ))}

          {allTasks.length === 0 && (
            <div className="text-center p-10 border border-dashed rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No tasks created yet
              </p>
              <Button
                onClick={() => setIsOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Task
              </Button>
            </div>
          )}
        </div>

        <Navigation />
      </div>
    </div>
  );
}
