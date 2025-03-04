
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTask } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/Navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const SpaceDetail = () => {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const { spaces, createTask } = useTask();
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date>();

  const space = spaces.find(s => s.id === spaceId);

  if (!space) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Space not found</h1>
        <Button onClick={() => navigate('/')}>Go back to Spaces</Button>
      </div>
    );
  }

  const handleCreateTask = () => {
    if (newTaskTitle.trim()) {
      createTask(space.id, newTaskTitle.trim(), newTaskDescription.trim(), newTaskDueDate);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskDueDate(undefined);
      setIsCreateTaskOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{space.name}</h1>
            <p className="text-gray-500 mt-1">
              {space.tasks.length} tasks, {space.tasks.filter(t => t.completed).length} completed
            </p>
          </div>
          <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600">
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Task title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Task description (optional)"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newTaskDueDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {newTaskDueDate ? format(newTaskDueDate, "PPP") : "Pick a due date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={newTaskDueDate}
                      onSelect={setNewTaskDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button onClick={handleCreateTask} className="w-full">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4 mb-20">
          {space.tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white p-4 rounded-lg shadow-sm border"
            >
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => {/* Will implement later */}}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                  )}
                  {task.dueDate && (
                    <p className="text-sm text-gray-500 mt-1">
                      Due: {format(new Date(task.dueDate), 'PPP')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Navigation />
      </div>
    </div>
  );
};

export default SpaceDetail;
