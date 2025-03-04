
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Task } from "@/types";
import { Calendar, Edit, Trash2 } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showActions?: boolean;
}

export const TaskCard = ({ task, onToggle, onEdit, onDelete, showActions = true }: TaskCardProps) => {
  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-200 dark:bg-gray-800/50 backdrop-blur-sm border dark:border-gray-700/50">
      <div className="flex items-center justify-between group">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className={`w-5 h-5 rounded-full border-2 transition-colors
              ${task.completed
                ? "bg-blue-500 border-blue-500 dark:bg-blue-600 dark:border-blue-600"
                : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
              }`}
          />
          <div className="flex flex-col">
            <span className={`${task.completed ? "line-through text-gray-500 dark:text-gray-400" : "dark:text-white"} transition-all`}>
              {task.title}
            </span>
            {task.description && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {task.description}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
          {showActions && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="hover:bg-red-100 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
