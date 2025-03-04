import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { useTask } from "@/contexts/TaskContext";
import { Sun, Moon, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Task } from "@/types";
import { TaskCard } from "@/components/TaskCard";

export default function Tasks() {
  const { spaces, createTask, toggleTaskCompletion, deleteTask, updateTask, createSubtask, toggleSubtaskCompletion } = useTask();
  const { theme, setTheme } = useTheme();
  const [newTaskData, setNewTaskData] = useState({
    title: "",
    description: "",
    dueDate: ""
  });
  const [editingTask, setEditingTask] = useState<{
    spaceId: string;
    task: Task;
    newSubtask: string;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const allTasks = spaces.flatMap(space => space.tasks);

  const handleCreateTask = () => {
    if (newTaskData.title.trim()) {
      createTask("", newTaskData.title, newTaskData.description, newTaskData.dueDate ? new Date(newTaskData.dueDate) : undefined);
      setNewTaskData({ title: "", description: "", dueDate: "" });
      setIsOpen(false);
    }
  };

  const handleUpdateTask = () => {
    if (editingTask) {
      updateTask(editingTask.spaceId, editingTask.task.id, {
        title: editingTask.task.title,
        description: editingTask.task.description,
        dueDate: editingTask.task.dueDate
      });
      setIsEditOpen(false);
    }
  };

  const handleCreateSubtask = () => {
    if (editingTask && editingTask.newSubtask.trim()) {
      createSubtask(editingTask.spaceId, editingTask.task.id, editingTask.newSubtask);
      setEditingTask({ ...editingTask, newSubtask: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Tasks</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage all your tasks</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="border dark:border-gray-700"
            >
              {theme === 'dark' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Todo
                </Button>
              </DialogTrigger>
              <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="dark:text-white">Create New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Task title"
                    value={newTaskData.title}
                    onChange={(e) => setNewTaskData(prev => ({ ...prev, title: e.target.value }))}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  />
                  <Textarea
                    placeholder="Task description (optional)"
                    value={newTaskData.description}
                    onChange={(e) => setNewTaskData(prev => ({ ...prev, description: e.target.value }))}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  />
                  <Input
                    type="date"
                    value={newTaskData.dueDate}
                    onChange={(e) => setNewTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <Button onClick={handleCreateTask} className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
                    Create Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 mb-20">
          {allTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={() => toggleTaskCompletion(task.spaceId, task.id)}
              onEdit={() => {
                setEditingTask({
                  spaceId: task.spaceId,
                  task: { ...task },
                  newSubtask: ''
                });
                setIsEditOpen(true);
              }}
              onDelete={() => deleteTask(task.spaceId, task.id)}
            />
          ))}
        </div>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="dark:text-white">Edit Task</DialogTitle>
            </DialogHeader>
            {editingTask && (
              <div className="space-y-4">
                <Input
                  placeholder="Task title"
                  value={editingTask.task.title}
                  onChange={(e) => setEditingTask({
                    ...editingTask,
                    task: { ...editingTask.task, title: e.target.value }
                  })}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
                <Textarea
                  placeholder="Task description"
                  value={editingTask.task.description || ''}
                  onChange={(e) => setEditingTask({
                    ...editingTask,
                    task: { ...editingTask.task, description: e.target.value }
                  })}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
                <Input
                  type="date"
                  value={editingTask.task.dueDate ? new Date(editingTask.task.dueDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditingTask({
                    ...editingTask,
                    task: { ...editingTask.task, dueDate: e.target.value ? new Date(e.target.value) : undefined }
                  })}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <div className="space-y-2">
                  <h3 className="text-sm font-medium dark:text-white">Subtasks</h3>
                  {editingTask.task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => toggleSubtaskCompletion(editingTask.spaceId, editingTask.task.id, subtask.id)}
                        className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <span className={`${subtask.completed ? "line-through text-gray-500 dark:text-gray-400" : "dark:text-white"}`}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="New subtask"
                      value={editingTask.newSubtask}
                      onChange={(e) => setEditingTask({ ...editingTask, newSubtask: e.target.value })}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                    <Button 
                      onClick={handleCreateSubtask}
                      className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      Add
                    </Button>
                  </div>
                </div>
                <Button 
                  onClick={handleUpdateTask} 
                  className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Save Changes
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Navigation />
      </div>
    </div>
  );
}
