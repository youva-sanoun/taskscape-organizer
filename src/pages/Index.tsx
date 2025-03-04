import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { useTask } from "@/contexts/TaskContext";
import { Plus, List, Clock, Trash2, MoreVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Index() {
  const { spaces, createSpace, deleteSpace } = useTask();
  const [newSpaceName, setNewSpaceName] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCreateSpace = () => {
    if (newSpaceName.trim()) {
      createSpace(newSpaceName.trim());
      setNewSpaceName("");
      setIsCreateOpen(false);
    }
  };

  const handleDeleteSpace = () => {
    if (spaceToDelete) {
      deleteSpace(spaceToDelete);
      setSpaceToDelete(null);
    }
  };

  const filteredSpaces = spaces.filter((space) => space.id !== "default");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Your Spaces
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your projects and tasks
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Space
              </Button>
            </DialogTrigger>
            <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="dark:text-white">
                  Create New Space
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Space name"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <Button
                  onClick={handleCreateSpace}
                  className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Create Space
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {filteredSpaces.map((space) => (
            <Card
              key={space.id}
              className="p-6 hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              onClick={(e) => {
                // Only navigate if not clicking on a button or dropdown
                if (!(e.target as HTMLElement).closest(".space-card-menu")) {
                  navigate(`/space/${space.id}`);
                }
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white cursor-pointer">
                  {space.name}
                </h3>
                <div className="space-card-menu">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="dark:bg-gray-800 dark:border-gray-700 space-card-menu"
                    >
                      <DropdownMenuItem
                        className="text-red-600 dark:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation(); // Important: stop event propagation
                          setSpaceToDelete(space.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Space
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Card content (progress bar, etc.) */}
              <div>
                <Progress
                  value={
                    (space.tasks.filter((t) => t.completed).length /
                      Math.max(space.tasks.length, 1)) *
                    100
                  }
                  className="mb-4"
                />
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <List className="w-4 h-4" />
                    <span>{space.tasks.length} tasks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {space.tasks.filter((t) => !t.completed).length} pending
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={!!spaceToDelete}
          onOpenChange={() => setSpaceToDelete(null)}
        >
          <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="dark:text-white">
                Delete Space
              </DialogTitle>
              <DialogDescription className="dark:text-gray-400">
                Are you sure you want to delete this space? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSpaceToDelete(null)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSpace}
                className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Navigation />
      </div>
    </div>
  );
}
