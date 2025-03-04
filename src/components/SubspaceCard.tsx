import { useState } from "react";
import { useTask } from "@/contexts/TaskContext";
import { Subspace } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Folder,
  FolderOpen,
  MoreVertical,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

interface SubspaceCardProps {
  subspace: Subspace;
  parentId?: string;
}

export const SubspaceCard = ({ subspace, parentId }: SubspaceCardProps) => {
  const { updateSubspace, deleteSubspace } = useTask();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(subspace.name);
  const [editDescription, setEditDescription] = useState(
    subspace.description || ""
  );
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Calculate task statistics
  const totalTasks = subspace.tasks.length;
  const completedTasks = subspace.tasks.filter((t) => t.completed).length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleSaveEdit = () => {
    updateSubspace(parentId || subspace.parentId, subspace.id, {
      name: editName.trim(),
      description: editDescription.trim(),
    });
    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to subspace
    deleteSubspace(parentId || subspace.parentId, subspace.id);
    setIsDeleteConfirmOpen(false);
  };

  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className="text-blue-500 dark:text-blue-400 mr-3">
            <FolderOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {subspace.name}
            </h3>
            {subspace.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {subspace.description}
              </p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="dark:bg-gray-800 dark:border-gray-700"
          >
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Subspace
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 dark:text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteConfirmOpen(true);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Subspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4">
        <div className="mb-2">
          <Progress value={completionPercentage} className="h-2" />
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>{completedTasks} completed</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{totalTasks - completedTasks} remaining</span>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={isEditing}
        onOpenChange={(open) => {
          setIsEditing(open);
          if (!open) {
            // Reset form on close
            setEditName(subspace.name);
            setEditDescription(subspace.description || "");
          }
        }}
      >
        <DialogContent
          className="dark:bg-gray-800 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle className="dark:text-white">Edit Subspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <Button
              onClick={handleSaveEdit}
              className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent
          className="dark:bg-gray-800 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              Delete Subspace
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Are you sure you want to delete{" "}
              <span className="font-medium">{subspace.name}</span>? All tasks
              within this subspace will be permanently deleted. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteConfirmOpen(false);
              }}
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
