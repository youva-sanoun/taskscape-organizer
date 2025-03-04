import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTask } from "@/contexts/TaskContext";
import { Navigation } from "@/components/Navigation";
import { Calendar } from "@/components/ui/calendar";
import { Task } from "@/types";
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addDays,
  differenceInDays,
  isToday,
  isPast,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function CalendarView() {
  const { spaces, toggleTaskCompletion } = useTask();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [monthStart, setMonthStart] = useState<Date>(startOfMonth(new Date()));
  const [monthEnd, setMonthEnd] = useState<Date>(endOfMonth(new Date()));
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState<
    (Task & { spaceName: string })[]
  >([]);
  const [taskCounts, setTaskCounts] = useState<
    Map<string, { total: number; completed: number }>
  >(new Map());

  // Get all tasks from all spaces
  const allTasks = spaces.flatMap((space) =>
    space.tasks.map((task) => ({ ...task, spaceName: space.name }))
  );

  // Update days in month when month changes
  useEffect(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    setMonthStart(start);
    setMonthEnd(end);

    // Calculate task counts for each day in the month
    const counts = new Map<string, { total: number; completed: number }>();

    eachDayOfInterval({ start, end }).forEach((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const tasksForDay = allTasks.filter(
        (task) => task.dueDate && isSameDay(new Date(task.dueDate), day)
      );

      if (tasksForDay.length > 0) {
        counts.set(dateStr, {
          total: tasksForDay.length,
          completed: tasksForDay.filter((t) => t.completed).length,
        });
      }
    });

    setTaskCounts(counts);
  }, [selectedDate, allTasks]);

  // Get tasks for selected date and show modal
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    setSelectedDate(date);
    const tasksForDay = allTasks.filter(
      (task) => task.dueDate && isSameDay(new Date(task.dueDate), date)
    );

    if (tasksForDay.length > 0) {
      setTasksForSelectedDate(tasksForDay);
      setIsTasksModalOpen(true);
    }
  };

  // Calculate progress for the month (days passed / total days)
  const today = new Date();
  const daysPassed = Math.min(
    differenceInDays(today, monthStart),
    differenceInDays(monthEnd, monthStart)
  );
  const totalDaysInMonth = differenceInDays(monthEnd, monthStart) + 1;
  const monthProgress = Math.max(
    0,
    Math.min(100, (daysPassed / totalDaysInMonth) * 100)
  );

  // Custom day renderer to show task counts
  const renderDay = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const counts = taskCounts.get(dateStr);
    const isTheDate = isToday(day);
    const isPastDate = isPast(day) && !isTheDate;

    // Calculate styling
    const hasTasksStyle = counts ? "font-medium " : "";
    const todayStyle = isTheDate
      ? "bg-blue-50 dark:bg-blue-900/20 font-bold rounded-full "
      : "";
    const pastStyle = isPastDate ? "text-gray-400 dark:text-gray-600 " : "";

    return (
      <div
        className={cn(
          "relative w-full h-full flex flex-col items-center justify-center py-1",
          hasTasksStyle,
          todayStyle,
          pastStyle,
          counts && "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/50"
        )}
      >
        <span className="text-center">{format(day, "d")}</span>

        {counts && (
          <div className="mt-1 flex items-center justify-center">
            <Badge
              variant={
                counts.completed === counts.total ? "outline" : "default"
              }
              className={cn(
                "text-[0.6rem] px-1 py-0 h-4 min-w-[18px] flex items-center justify-center",
                counts.completed === counts.total &&
                  "text-green-600 dark:text-green-400 border-green-400"
              )}
            >
              {counts.total}
            </Badge>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Calendar
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track your tasks by due dates
            </p>
          </div>
        </div>

        {/* Monthly Progress */}
        <Card className="mb-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Monthly Progress
              </h2>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {format(monthStart, "MMMM yyyy")}
              </div>
            </div>

            <Progress value={monthProgress} className="h-2" />

            <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{format(monthStart, "MMM d")}</span>
              <span>Today: {format(today, "MMM d")}</span>
              <span>{format(monthEnd, "MMM d")}</span>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card className="mb-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(addDays(monthStart, -1))}
                className="dark:border-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous month</span>
              </Button>

              <div className="text-lg font-medium text-gray-900 dark:text-white">
                {format(selectedDate, "MMMM yyyy")}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(addDays(monthEnd, 1))}
                className="dark:border-gray-700"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next month</span>
              </Button>
            </div>

            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              month={selectedDate}
              className="rounded-md border border-gray-200 dark:border-gray-700"
              components={{
                Day: ({ date }) => renderDay(date),
              }}
            />
          </CardContent>
        </Card>

        {/* Task count summary boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-20">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Tasks This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Array.from(taskCounts.values()).reduce(
                  (sum, { total }) => sum + total,
                  0
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Array.from(taskCounts.values()).reduce(
                  (sum, { completed }) => sum + completed,
                  0
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Array.from(taskCounts.values()).reduce(
                  (sum, { total, completed }) => sum + (total - completed),
                  0
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialog for tasks on selected date */}
        <Dialog open={isTasksModalOpen} onOpenChange={setIsTasksModalOpen}>
          <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="dark:text-white">
                Tasks for {format(selectedDate, "MMM d, yyyy")}
              </DialogTitle>
              <DialogDescription className="dark:text-gray-400">
                {tasksForSelectedDate.length} tasks scheduled for this day
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-3">
                {tasksForSelectedDate.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start p-3 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() =>
                        toggleTaskCompletion(task.spaceId, task.id)
                      }
                      className="mt-1"
                    />

                    <div
                      className="flex-1 ml-3 cursor-pointer"
                      onClick={() => {
                        setIsTasksModalOpen(false);
                        navigate(`/task/${task.spaceId}/${task.id}`);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <h3
                          className={cn(
                            "font-medium text-gray-900 dark:text-white",
                            task.completed &&
                              "line-through text-gray-500 dark:text-gray-400"
                          )}
                        >
                          {task.title}
                        </h3>

                        <Badge variant="outline" className="ml-2">
                          {task.spaceName}
                        </Badge>
                      </div>

                      {task.description && (
                        <p
                          className={cn(
                            "mt-1 text-sm text-gray-600 dark:text-gray-300",
                            task.completed &&
                              "line-through text-gray-400 dark:text-gray-500"
                          )}
                        >
                          {task.description.length > 100
                            ? `${task.description.slice(0, 100)}...`
                            : task.description}
                        </p>
                      )}

                      <div className="flex items-center mt-2 text-xs">
                        {task.completed ? (
                          <span className="flex items-center text-green-500 dark:text-green-400">
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Completed
                          </span>
                        ) : (
                          <span className="flex items-center text-gray-500 dark:text-gray-400">
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            In progress
                          </span>
                        )}

                        {task.priority && (
                          <span
                            className={cn(
                              "ml-3 px-1.5 py-0.5 rounded text-xs font-medium",
                              task.priority === "high"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                : task.priority === "medium"
                                ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            )}
                          >
                            {task.priority.charAt(0).toUpperCase() +
                              task.priority.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex justify-end">
              <Button
                variant="default"
                onClick={() => setIsTasksModalOpen(false)}
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Navigation />
      </div>
    </div>
  );
}
