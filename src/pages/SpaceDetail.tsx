import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTask } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/Navigation';
import { TaskCard } from '@/components/TaskCard';
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
import { CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{space.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {space.tasks.length} tasks, {space.tasks.filter(t => t.completed).length} completed
            </p>
          </div>
          <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="dark:text-white">Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Task title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
                <Textarea
                  placeholder="Task description (optional)"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal dark:bg-gray-700 dark:border-gray-600 dark:text-white",
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
                      className="dark:bg-gray-800 dark:border-gray-700"
                    />
                  </PopoverContent>
                </Popover>
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

        <div className="space-y-4 mb-20">
          {space.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={() => {/* Will implement later */}}
              onEdit={() => {/* Will implement later */}}
              onDelete={() => {/* Will implement later */}}
            />
          ))}
        </div>

        <Navigation />
      </div>
    </div>
  );
};

export default SpaceDetail;
