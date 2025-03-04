import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTask } from "@/contexts/TaskContext";
import { Priority, Space } from "@/types"; // Add Space type import
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";
import { TaskCard } from "@/components/TaskCard";
import { SubspaceCard } from "@/components/SubspaceCard"; // We'll create this component next
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  SortDesc,
  Edit,
  FolderPlus,
  FolderOpen, // Add this import
} from "lucide-react";
import { format } from "date-fns";
import { CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";

type FilterOption = "all" | "active" | "completed";
type SortOption = "dueDate" | "priority" | "createdAt";
type SortDirection = "asc" | "desc";

const SpaceDetail = () => {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isSubspace = searchParams.get("isSubspace") === "true";
  const parentSpaceId = searchParams.get("parentId");

  const {
    spaces,
    createTask,
    updateTask,
    toggleTaskCompletion,
    deleteTask,
    updateSpace,
    createSubspace,
    updateSubspace,
    deleteSubspace,
  } = useTask();

  // Task creation state
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date>();
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("medium");
  const [selectedSubspace, setSelectedSubspace] = useState<string | null>(null);

  // Subspace creation state
  const [isCreateSubspaceOpen, setIsCreateSubspaceOpen] = useState(false);
  const [newSubspaceName, setNewSubspaceName] = useState("");
  const [newSubspaceDescription, setNewSubspaceDescription] = useState("");

  // Space editing state
  const [isEditingSpace, setIsEditingSpace] = useState(false);
  const [editSpaceName, setEditSpaceName] = useState("");
  const [editSpaceDescription, setEditSpaceDescription] = useState("");

  // Search, filter, sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  const [sortOption, setSortOption] = useState<SortOption>("dueDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Tab state
  const [activeTab, setActiveTab] = useState("tasks");

  // Find the space or subspace
  const parentSpace = parentSpaceId
    ? spaces.find((s) => s.id === parentSpaceId)
    : null;
  const space =
    isSubspace && parentSpace
      ? parentSpace.subspaces.find((s) => s.id === spaceId)
      : spaces.find((s) => s.id === spaceId);

  // Reference the space or subspace once, stably
  const effectiveSpace = useMemo(() => {
    if (isSubspace && space) {
      return { ...space, subspaces: [] };
    }
    return space as Space | undefined;
  }, [isSubspace, space]);

  // Use useEffect to set editing states only when effectiveSpace changes
  useEffect(() => {
    if (effectiveSpace) {
      setEditSpaceName(effectiveSpace.name);
      setEditSpaceDescription(effectiveSpace.description || "");
    }
  }, [effectiveSpace]);

  if (!effectiveSpace) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Space not found</h1>
        <Button onClick={() => navigate("/spaces")}>Go back to Spaces</Button>
      </div>
    );
  }

  const handleCreateTask = () => {
    if (newTaskTitle.trim()) {
      if (isSubspace && parentSpace && effectiveSpace) {
        createTask(
          parentSpace.id,
          newTaskTitle.trim(),
          newTaskDescription.trim(),
          newTaskDueDate,
          newTaskPriority,
          effectiveSpace.id
        );
      } else {
        createTask(
          effectiveSpace.id,
          newTaskTitle.trim(),
          newTaskDescription.trim(),
          newTaskDueDate,
          newTaskPriority,
          selectedSubspace || undefined
        );
      }
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskDueDate(undefined);
      setNewTaskPriority("medium");
      setSelectedSubspace(null);
      setIsCreateTaskOpen(false);
    }
  };

  const handleCreateSubspace = () => {
    // Only allow creating subspaces in top-level spaces, not in subspaces
    if (!isSubspace && newSubspaceName.trim()) {
      createSubspace(
        effectiveSpace.id,
        newSubspaceName.trim(),
        newSubspaceDescription.trim()
      );
      setNewSubspaceName("");
      setNewSubspaceDescription("");
      setIsCreateSubspaceOpen(false);
      setActiveTab("subspaces");
    }
  };

  const handleUpdateSpace = () => {
    if (isSubspace && parentSpace) {
      updateSubspace(parentSpace.id, effectiveSpace.id, {
        name: editSpaceName,
        description: editSpaceDescription,
      });
    } else {
      updateSpace(effectiveSpace.id, {
        name: editSpaceName,
        description: editSpaceDescription,
      });
    }
    setIsEditingSpace(false);
  };

  // Calculate stats
  const completedTasks = effectiveSpace.tasks.filter((t) => t.completed).length;
  const inProgressTasks = effectiveSpace.tasks.filter(
    (t) => !t.completed
  ).length;
  const highPriorityTasks = effectiveSpace.tasks.filter(
    (t) => t.priority === "high" && !t.completed
  ).length;

  // Also include tasks from subspaces in stats
  const subspaceTasks = effectiveSpace.subspaces.flatMap((s) => s.tasks);
  const subspaceCompletedTasks = subspaceTasks.filter(
    (t) => t.completed
  ).length;
  const subspaceInProgressTasks = subspaceTasks.filter(
    (t) => !t.completed
  ).length;
  const subspaceHighPriorityTasks = subspaceTasks.filter(
    (t) => t.priority === "high" && !t.completed
  ).length;

  const totalTasks = effectiveSpace.tasks.length + subspaceTasks.length;
  const totalCompletedTasks = completedTasks + subspaceCompletedTasks;
  const totalInProgressTasks = inProgressTasks + subspaceInProgressTasks;
  const totalHighPriorityTasks = highPriorityTasks + subspaceHighPriorityTasks;

  // Today's due tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueTodayTasks = effectiveSpace.tasks.filter((t) => {
    if (!t.dueDate || t.completed) return false;
    const dueDate = new Date(t.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  }).length;

  const subspaceDueTodayTasks = subspaceTasks.filter((t) => {
    if (!t.dueDate || t.completed) return false;
    const dueDate = new Date(t.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  }).length;

  const totalDueTodayTasks = dueTodayTasks + subspaceDueTodayTasks;

  // Adjust tasks retrieval based on whether this is a subspace
  const actualTasks = isSubspace ? effectiveSpace.tasks : effectiveSpace.tasks;

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = actualTasks;

    // Apply filter
    if (filterOption === "active") {
      filtered = filtered.filter((task) => !task.completed);
    } else if (filterOption === "completed") {
      filtered = filtered.filter((task) => task.completed);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
      );
    }

    // Apply sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortOption === "dueDate") {
        if (!a.dueDate) return sortDirection === "asc" ? 1 : -1;
        if (!b.dueDate) return sortDirection === "asc" ? -1 : 1;
        return sortDirection === "asc"
          ? a.dueDate.getTime() - b.dueDate.getTime()
          : b.dueDate.getTime() - a.dueDate.getTime();
      }

      if (sortOption === "priority") {
        const priorityValue = { high: 3, medium: 2, low: 1 };
        return sortDirection === "asc"
          ? (priorityValue[a.priority] || 0) - (priorityValue[b.priority] || 0)
          : (priorityValue[b.priority] || 0) - (priorityValue[a.priority] || 0);
      }

      // Default to createdAt
      return sortDirection === "asc"
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime();
    });

    return sorted;
  }, [actualTasks, filterOption, sortOption, sortDirection, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto p-6">
        {/* Add navigation breadcrumb for subspaces */}
        {isSubspace && parentSpace && (
          <div className="mb-4">
            <Button
              variant="link"
              className="p-0 text-blue-500 dark:text-blue-400"
              onClick={() => navigate(`/space/${parentSpace.id}`)}
            >
              {parentSpace.name}
            </Button>
            <span className="mx-2 text-gray-500 dark:text-gray-400">/</span>
            <span className="text-gray-700 dark:text-gray-300">
              {effectiveSpace.name}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="flex items-center gap-2">
              {isSubspace && (
                <span className="text-blue-500 dark:text-blue-400">
                  <FolderOpen className="h-5 w-5 mr-2" />
                </span>
              )}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {effectiveSpace.name}
              </h1>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setIsEditingSpace(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {actualTasks.length} tasks,{" "}
              {actualTasks.filter((t) => t.completed).length} completed
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
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
                  <div className="flex gap-3">
                    <div className="flex-1">
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
                            {newTaskDueDate
                              ? format(newTaskDueDate, "PPP")
                              : "Set due date"}
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
                    </div>
                    <div className="flex-1">
                      <Select
                        value={newTaskPriority}
                        onValueChange={(value) =>
                          setNewTaskPriority(value as Priority)
                        }
                      >
                        <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Subspace selection */}
                  {effectiveSpace.subspaces.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Location (optional)
                      </label>
                      <select
                        value={selectedSubspace || ""}
                        onChange={(e) =>
                          setSelectedSubspace(e.target.value || null)
                        }
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="">Main space</option>
                        {effectiveSpace.subspaces.map((subspace) => (
                          <option key={subspace.id} value={subspace.id}>
                            {subspace.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <Button
                    onClick={handleCreateTask}
                    className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    Create Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Only show Add Subspace button for top-level spaces */}
            {!isSubspace && (
              <Dialog
                open={isCreateSubspaceOpen}
                onOpenChange={setIsCreateSubspaceOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700">
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Add Subspace
                  </Button>
                </DialogTrigger>
                <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="dark:text-white">
                      Create New Subspace
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Subspace name"
                      value={newSubspaceName}
                      onChange={(e) => setNewSubspaceName(e.target.value)}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                    <Textarea
                      placeholder="Subspace description (optional)"
                      value={newSubspaceDescription}
                      onChange={(e) =>
                        setNewSubspaceDescription(e.target.value)
                      }
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                    <Button
                      onClick={handleCreateSubspace}
                      className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                    >
                      Create Subspace
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Space description */}
        {effectiveSpace.description && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {effectiveSpace.description}
            </p>
          </div>
        )}

        {/* Dashboard stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                In Progress
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalInProgressTasks}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Completed
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalCompletedTasks}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                High Priority
              </div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {totalHighPriorityTasks}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Due Today
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {totalDueTodayTasks}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search, filter, sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              className="pl-9 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="dark:bg-gray-800 dark:border-gray-700">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={filterOption}
                onValueChange={(value) =>
                  setFilterOption(value as FilterOption)
                }
              >
                <DropdownMenuRadioItem value="all">
                  All Tasks
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="active">
                  Active Tasks
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="completed">
                  Completed Tasks
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <SortDesc className="h-4 w-4" />
                <span>Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="dark:bg-gray-800 dark:border-gray-700">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={sortOption}
                onValueChange={(value) => setSortOption(value as SortOption)}
              >
                <DropdownMenuRadioItem value="dueDate">
                  Due Date
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="priority">
                  Priority
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="createdAt">
                  Created At
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Direction</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={sortDirection}
                onValueChange={(value) =>
                  setSortDirection(value as SortDirection)
                }
              >
                <DropdownMenuRadioItem value="asc">
                  Ascending
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="desc">
                  Descending
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Only show tasks tab for subspaces, both tabs for top-level spaces */}
        {isSubspace ? (
          <div className="space-y-4 mb-20">
            {filteredAndSortedTasks.map((task) => (
              <div
                key={task.id}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("button")) {
                    return;
                  }
                  navigate(
                    isSubspace && parentSpace
                      ? `/task/${parentSpace.id}/${task.id}?subspace=${effectiveSpace.id}`
                      : `/task/${effectiveSpace.id}/${task.id}`
                  );
                }}
                className="cursor-pointer transition-transform hover:translate-y-[-2px]"
              >
                <TaskCard
                  task={task}
                  onToggle={(id) => {
                    // Stop event propagation to prevent navigation
                    toggleTaskCompletion(effectiveSpace.id, id);
                  }}
                  onEdit={(updates) => {
                    // Stop event propagation to prevent navigation
                    updateTask(effectiveSpace.id, task.id, updates);
                  }}
                  onDelete={() => {
                    // Stop event propagation to prevent navigation
                    deleteTask(effectiveSpace.id, task.id);
                  }}
                />
              </div>
            ))}

            {filteredAndSortedTasks.length === 0 && (
              <div className="text-center p-10 border border-dashed rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No tasks in this {isSubspace ? "subspace" : "space"}
                </p>
                <Button
                  onClick={() => setIsCreateTaskOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create a Task
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="subspaces">Subspaces</TabsTrigger>
            </TabsList>
            <TabsContent value="tasks">
              <div className="space-y-4 mb-20">
                {filteredAndSortedTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={(e) => {
                      // Prevent event bubbling if clicking on controls inside the card
                      if ((e.target as HTMLElement).closest("button")) {
                        return;
                      }
                      navigate(`/task/${effectiveSpace.id}/${task.id}`);
                    }}
                    className="cursor-pointer transition-transform hover:translate-y-[-2px]"
                  >
                    <TaskCard
                      task={task}
                      onToggle={(id) => {
                        // Stop event propagation to prevent navigation
                        toggleTaskCompletion(effectiveSpace.id, id);
                      }}
                      onEdit={(updates) => {
                        // Stop event propagation to prevent navigation
                        updateTask(effectiveSpace.id, task.id, updates);
                      }}
                      onDelete={() => {
                        // Stop event propagation to prevent navigation
                        deleteTask(effectiveSpace.id, task.id);
                      }}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="subspaces">
              <div className="space-y-4 mb-20">
                {effectiveSpace.subspaces?.map((subspace) => (
                  <div
                    key={subspace.id}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest("button")) return;
                      navigate(
                        `/space/${subspace.id}?isSubspace=true&parentId=${effectiveSpace.id}`
                      );
                    }}
                    className="cursor-pointer transition-transform hover:translate-y-[-2px]"
                  >
                    <SubspaceCard subspace={subspace} />
                  </div>
                ))}

                {(!effectiveSpace.subspaces ||
                  effectiveSpace.subspaces.length === 0) && (
                  <div className="text-center p-10 border border-dashed rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No subspaces yet
                    </p>
                    <Button
                      onClick={() => setIsCreateSubspaceOpen(true)}
                      className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                    >
                      <FolderPlus className="w-4 h-4 mr-2" />
                      Create a Subspace
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Space Editing Dialog */}
        <Dialog open={isEditingSpace} onOpenChange={setIsEditingSpace}>
          <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="dark:text-white">Edit Space</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Space Name
                </label>
                <Input
                  value={editSpaceName}
                  onChange={(e) => setEditSpaceName(e.target.value)}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <Textarea
                  value={editSpaceDescription}
                  onChange={(e) => setEditSpaceDescription(e.target.value)}
                  placeholder="Describe what this space is about..."
                  rows={5}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <Button
                onClick={handleUpdateSpace}
                className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Navigation />
      </div>
    </div>
  );
};

export default SpaceDetail;
