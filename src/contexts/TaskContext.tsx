import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Space, Task, Subtask } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface TaskContextType {
  spaces: Space[];
  createSpace: (name: string) => void;
  deleteSpace: (id: string) => void;
  createTask: (spaceId: string, title: string, description?: string, dueDate?: Date) => void;
  deleteTask: (spaceId: string, taskId: string) => void;
  updateTask: (spaceId: string, taskId: string, updates: Partial<Task>) => void;
  toggleTaskCompletion: (spaceId: string, taskId: string) => void;
  createSubtask: (spaceId: string, taskId: string, title: string) => void;
  deleteSubtask: (spaceId: string, taskId: string, subtaskId: string) => void;
  toggleSubtaskCompletion: (spaceId: string, taskId: string, subtaskId: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const STORAGE_KEY = 'task-management-data';

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [spaces, setSpaces] = useState<Space[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [{
      id: "default",
      name: "Default",
      tasks: [],
      createdAt: new Date()
    }];
  });
  
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(spaces));
  }, [spaces]);

  const createSpace = useCallback((name: string) => {
    if (!name.trim()) return;
    
    setSpaces(prev => [...prev, {
      id: crypto.randomUUID(),
      name,
      tasks: [],
      createdAt: new Date()
    }]);
    toast({ description: "Space created successfully" });
  }, [toast]);

  const createTask = useCallback((spaceId: string, title: string, description?: string, dueDate?: Date) => {
    if (!title.trim()) return;
    
    const targetSpaceId = spaceId || "default";
    
    setSpaces(prev => prev.map(space => {
      if (space.id === targetSpaceId) {
        return {
          ...space,
          tasks: [...space.tasks, {
            id: crypto.randomUUID(),
            title,
            description,
            completed: false,
            dueDate,
            spaceId: targetSpaceId,
            subtasks: [],
            createdAt: new Date()
          }]
        };
      }
      return space;
    }));
    toast({ description: "Task created successfully" });
  }, [toast]);

  const deleteTask = useCallback((spaceId: string, taskId: string) => {
    setSpaces(prev => prev.map(space => {
      if (space.id === spaceId) {
        return {
          ...space,
          tasks: space.tasks.filter(task => task.id !== taskId)
        };
      }
      return space;
    }));
    toast({ description: "Task deleted successfully" });
  }, [toast]);

  const updateTask = useCallback((spaceId: string, taskId: string, updates: Partial<Task>) => {
    setSpaces(prev => prev.map(space => {
      if (space.id === spaceId) {
        return {
          ...space,
          tasks: space.tasks.map(task => {
            if (task.id === taskId) {
              return { ...task, ...updates };
            }
            return task;
          })
        };
      }
      return space;
    }));
    toast({ description: "Task updated successfully" });
  }, [toast]);

  const toggleTaskCompletion = useCallback((spaceId: string, taskId: string) => {
    setSpaces(prev => prev.map(space => {
      if (space.id === spaceId) {
        return {
          ...space,
          tasks: space.tasks.map(task => {
            if (task.id === taskId) {
              return { ...task, completed: !task.completed };
            }
            return task;
          })
        };
      }
      return space;
    }));
  }, []);

  const createSubtask = useCallback((spaceId: string, taskId: string, title: string) => {
    setSpaces(prev => prev.map(space => {
      if (space.id === spaceId) {
        return {
          ...space,
          tasks: space.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                subtasks: [...task.subtasks, {
                  id: crypto.randomUUID(),
                  title,
                  completed: false,
                  taskId,
                  createdAt: new Date()
                }]
              };
            }
            return task;
          })
        };
      }
      return space;
    }));
    toast({ description: "Subtask created successfully" });
  }, [toast]);

  const deleteSubtask = useCallback((spaceId: string, taskId: string, subtaskId: string) => {
    setSpaces(prev => prev.map(space => {
      if (space.id === spaceId) {
        return {
          ...space,
          tasks: space.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId)
              };
            }
            return task;
          })
        };
      }
      return space;
    }));
    toast({ description: "Subtask deleted successfully" });
  }, [toast]);

  const toggleSubtaskCompletion = useCallback((spaceId: string, taskId: string, subtaskId: string) => {
    setSpaces(prev => prev.map(space => {
      if (space.id === spaceId) {
        return {
          ...space,
          tasks: space.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                subtasks: task.subtasks.map(subtask => {
                  if (subtask.id === subtaskId) {
                    return { ...subtask, completed: !subtask.completed };
                  }
                  return subtask;
                })
              };
            }
            return task;
          })
        };
      }
      return space;
    }));
  }, []);

  const deleteSpace = useCallback((id: string) => {
    setSpaces(prev => prev.filter(space => space.id !== id));
    toast({ description: "Space deleted successfully" });
  }, [toast]);

  return (
    <TaskContext.Provider value={{
      spaces,
      createSpace,
      deleteSpace,
      createTask,
      deleteTask,
      updateTask,
      toggleTaskCompletion,
      createSubtask,
      deleteSubtask,
      toggleSubtaskCompletion,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
