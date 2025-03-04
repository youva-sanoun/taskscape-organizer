import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTask } from "@/contexts/TaskContext";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Navigation } from "@/components/Navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Subtask } from "@/types"; // Import Subtask type
import {
  Calendar,
  Plus,
  Trash2,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flag,
  Edit,
  Layout,
  FolderOpen,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

const TaskDetail = () => {
  const { spaceId, taskId } = useParams();
  const [searchParams] = useSearchParams();
  const subspaceId = searchParams.get("subspace");
  const navigate = useNavigate();
  const {
    spaces,
    updateTask,
    toggleTaskCompletion,
    createSubtask,
    deleteSubtask,
    toggleSubtaskCompletion,
  } = useTask();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState<Date | undefined>(undefined);
  const [editPriority, setEditPriority] = useState<string>("medium");

  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isDeleteSubtaskOpen, setIsDeleteSubtaskOpen] = useState<string | null>(
    null
  );

  const [reorderedSubtasks, setReorderedSubtasks] = useState<Subtask[]>([]);

  // Find the space and task
  const space = spaces.find((s) => s.id === spaceId);

  // Find task either in space or in subspace
  const subspace = space?.subspaces.find((s) => s.id === subspaceId);
  const task =
    subspaceId && subspace
      ? subspace.tasks.find((t) => t.id === taskId)
      : space?.tasks.find((t) => t.id === taskId);

  useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDescription(task.description || "");
      setEditDueDate(task.dueDate);
      setEditPriority(task.priority || "medium");
    }
  }, [task]);

  useEffect(() => {
    if (task?.subtasks) {
      setReorderedSubtasks([...task.subtasks]);
    }
  }, [task?.subtasks]);

  if (!space || !task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Task not found</h1>
        <Button onClick={() => navigate(`/space/${spaceId}`)}>
          Go back to space.
        </Button>
      </div>
    );
  }

  const handleUpdateTask = () => {
    updateTask(
      space.id,
      task.id,
      {
        title: editTitle,
        description: editDescription,
        dueDate: editDueDate,
        priority: editPriority as "low" | "medium" | "high",
      },
      subspaceId || undefined
    );
    setIsEditing(false);
  };

  const handleCreateSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      createSubtask(
        space.id,
        task.id,
        newSubtaskTitle.trim(),
        subspaceId || undefined
      );
      setNewSubtaskTitle("");
    }
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    deleteSubtask(space.id, task.id, subtaskId, subspaceId || undefined);
    setIsDeleteSubtaskOpen(null);
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    // If dropped outside the list or no movement
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    const newSubtasks = Array.from(reorderedSubtasks);
    const [removed] = newSubtasks.splice(source.index, 1);
    newSubtasks.splice(destination.index, 0, removed);

    setReorderedSubtasks(newSubtasks);

    // Update the subtask order in the backend
    updateTask(
      space.id,
      task.id,
      { subtasks: newSubtasks },
      subspaceId || undefined
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "medium":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <Flag className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case "medium":
        return (
          <Flag className="w-4 h-4 text-orange-600 dark:text-orange-400" />
        );
      case "low":
        return <Flag className="w-4 h-4 text-green-600 dark:text-green-400" />;
      default:
        return <Flag className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const isOverdue =
    task.dueDate && !task.completed && new Date() > task.dueDate;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 mr-auto"
              onClick={() => navigate(`/space/${spaceId}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to{" "}
              {subspace ? `${subspace.name} in ${space.name}` : space.name}
            </Button>

            {subspace && (
              <div className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs px-2 py-1 rounded">
                <FolderOpen className="inline-block h-3 w-3 mr-1" />
                In Subspace
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() =>
                  toggleTaskCompletion(
                    space.id,
                    task.id,
                    subspaceId || undefined
                  )
                }
                className="h-5 w-5"
              />
              <h1
                className={cn(
                  "text-2xl font-bold text-gray-900 dark:text-white",
                  task.completed &&
                    "line-through text-gray-500 dark:text-gray-400"
                )}
              >
                {task.title}
              </h1>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Task
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-2">
            <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                Details
              </h2>

              {task.description ? (
                <div className="mb-6 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {task.description}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 mb-6 italic">
                  No description provided
                </p>
              )}

              <h2 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
                Subtasks
              </h2>

              <form
                onSubmit={handleCreateSubtask}
                className="flex items-center gap-2 mb-4"
              >
                <Input
                  placeholder="Add subtask..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <Button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </form>

              <div className="space-y-2">
                {reorderedSubtasks && reorderedSubtasks.length > 0 ? (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="subtasks">
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {reorderedSubtasks.map((subtask, index) => (
                            <Draggable
                              key={subtask.id}
                              draggableId={subtask.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={cn(
                                    "flex items-center justify-between rounded-md p-2",
                                    snapshot.isDragging
                                      ? "bg-blue-50 dark:bg-blue-900/20"
                                      : "hover:bg-gray-100 dark:hover:bg-gray-700/50"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="cursor-grab text-gray-400 px-1"
                                    >
                                      ⋮⋮
                                    </div>
                                    <Checkbox
                                      checked={subtask.completed}
                                      onCheckedChange={() =>
                                        toggleSubtaskCompletion(
                                          space.id,
                                          task.id,
                                          subtask.id
                                        )
                                      }
                                    />
                                    <span
                                      className={cn(
                                        "text-gray-800 dark:text-gray-200",
                                        subtask.completed &&
                                          "line-through text-gray-500 dark:text-gray-400"
                                      )}
                                    >
                                      {subtask.title}
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setIsDeleteSubtaskOpen(subtask.id)
                                    }
                                    className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No subtasks yet
                  </p>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                Status
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {task.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="text-gray-700 dark:text-gray-300">
                    {task.completed ? "Completed" : "In Progress"}
                  </span>
                </div>

                {task.dueDate && (
                  <div
                    className={cn(
                      "flex items-center gap-2",
                      isOverdue &&
                        !task.completed &&
                        "text-red-500 dark:text-red-400"
                    )}
                  >
                    <Calendar className="h-5 w-5" />
                    <span>{format(new Date(task.dueDate), "PPP")}</span>
                    {isOverdue && !task.completed && (
                      <AlertTriangle className="h-4 w-4 ml-1" />
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Created {format(new Date(task.createdAt), "PPP")}
                  </span>
                </div>

                {task.priority && (
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(task.priority)}
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority.charAt(0).toUpperCase() +
                        task.priority.slice(1)}{" "}
                      Priority
                    </Badge>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                Progress
              </h2>
              {task.subtasks && task.subtasks.length > 0 ? (
                <div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{
                        width: `${
                          (task.subtasks.filter((st) => st.completed).length /
                            task.subtasks.length) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {task.subtasks.filter((st) => st.completed).length} of{" "}
                    {task.subtasks.length} completed
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No subtasks to track
                </p>
              )}
            </Card>
          </div>
        </div>

        {/* Edit Task Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="dark:text-white">Edit Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
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
                  rows={5}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal dark:bg-gray-700 dark:border-gray-600 dark:text-white",
                          !editDueDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {editDueDate
                          ? format(new Date(editDueDate), "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={editDueDate}
                        onSelect={setEditDueDate}
                        initialFocus
                        className="dark:bg-gray-800 dark:border-gray-700"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <Select value={editPriority} onValueChange={setEditPriority}>
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder="Set priority" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleUpdateTask}
                className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Subtask Confirmation */}
        <Dialog
          open={!!isDeleteSubtaskOpen}
          onOpenChange={() => setIsDeleteSubtaskOpen(null)}
        >
          <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="dark:text-white">
                Delete Subtask
              </DialogTitle>
              <DialogDescription className="dark:text-gray-400">
                Are you sure you want to delete this subtask? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteSubtaskOpen(null)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  isDeleteSubtaskOpen &&
                  handleDeleteSubtask(isDeleteSubtaskOpen)
                }
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
};

export default TaskDetail;
