import { useState } from "react";
import { Task, Priority } from "@/contexts/TaskContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pencil,
  Trash2,
  Calendar,
  AlertCircle,
  MoreVertical,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export const TaskCard = ({
  task,
  onToggle,
  onEdit,
  onDelete,
}: TaskCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editDueDate, setEditDueDate] = useState<Date | undefined>(
    task.dueDate
  );
  const [editPriority, setEditPriority] = useState<Priority>(
    task.priority || "medium"
  );
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleSaveEdit = () => {
    onEdit({
      title: editTitle,
      description: editDescription,
      dueDate: editDueDate,
      priority: editPriority,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(task.id);
    setIsDeleteConfirmOpen(false);
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-orange-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    const color = {
      high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      medium:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    }[priority];

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${color} font-medium`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const isOverdue =
    task.dueDate && !task.completed && new Date() > task.dueDate;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop propagation to prevent parent click handler
    onToggle(task.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop propagation to prevent parent click handler
    setIsDeleteConfirmOpen(true);
  };

  return (
    <div
      className={cn(
        "p-4 rounded-lg border shadow-sm transition-all",
        task.completed
          ? "bg-gray-50 dark:bg-gray-800/50 opacity-70"
          : "bg-white dark:bg-gray-800",
        isOverdue && !task.completed
          ? "border-red-300 dark:border-red-800"
          : "border-gray-200 dark:border-gray-700"
      )}
    >
      <div className="flex items-start gap-3">
        <div onClick={handleToggle} className="mt-1">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => onToggle(task.id)}
            className="mt-1"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3
              className={cn(
                "font-medium text-gray-900 dark:text-white break-words",
                task.completed &&
                  "line-through text-gray-500 dark:text-gray-400"
              )}
            >
              {task.title}
            </h3>
            <div className="flex items-center space-x-2 flex-shrink-0">
              {task.priority && getPriorityBadge(task.priority)}
            </div>
          </div>

          {task.description && (
            <p
              className={cn(
                "text-sm text-gray-600 dark:text-gray-300 mt-1 break-words",
                task.completed &&
                  "line-through text-gray-400 dark:text-gray-500"
              )}
            >
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center mt-2 gap-3 text-xs text-gray-500 dark:text-gray-400">
            {task.dueDate && (
              <div
                className={cn(
                  "flex items-center gap-1",
                  isOverdue &&
                    !task.completed &&
                    "text-red-500 dark:text-red-400"
                )}
              >
                <Calendar className="w-3 h-3" />
                <span>{format(task.dueDate, "PPP")}</span>
                {isOverdue && !task.completed && (
                  <AlertCircle className="w-3 h-3 text-red-500" />
                )}
              </div>
            )}

            <div className="flex items-center ml-auto space-x-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="dark:bg-gray-800 dark:border-gray-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem
                    className="text-red-600 dark:text-red-400"
                    onClick={handleDeleteClick}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Delete Task</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Are you sure you want to delete this task? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
