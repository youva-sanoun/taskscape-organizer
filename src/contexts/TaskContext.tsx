import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { Space, Task, Priority, Subtask, Subspace } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface TaskContextType {
  spaces: Space[];
  createSpace: (name: string) => void;
  updateSpace: (id: string, updates: Partial<Space>) => void;
  deleteSpace: (id: string) => void;
  createSubspace: (
    parentId: string,
    name: string,
    description?: string
  ) => void;
  updateSubspace: (
    parentId: string,
    subspaceId: string,
    updates: Partial<Subspace>
  ) => void;
  deleteSubspace: (parentId: string, subspaceId: string) => void;
  createTask: (
    spaceId: string,
    title: string,
    description: string,
    dueDate?: Date,
    priority?: Priority,
    subspaceId?: string
  ) => void;
  updateTask: (
    spaceId: string,
    taskId: string,
    updates: Partial<Task>,
    subspaceId?: string
  ) => void;
  toggleTaskCompletion: (
    spaceId: string,
    taskId: string,
    subspaceId?: string
  ) => void;
  deleteTask: (spaceId: string, taskId: string, subspaceId?: string) => void;
  createSubtask: (
    spaceId: string,
    taskId: string,
    title: string,
    subspaceId?: string
  ) => void;
  deleteSubtask: (
    spaceId: string,
    taskId: string,
    subtaskId: string,
    subspaceId?: string
  ) => void;
  toggleSubtaskCompletion: (
    spaceId: string,
    taskId: string,
    subtaskId: string,
    subspaceId?: string
  ) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const STORAGE_KEY = "taskscape-data";

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [spaces, setSpaces] = useState<Space[]>(() => {
    const savedSpaces = localStorage.getItem(STORAGE_KEY);
    if (savedSpaces) {
      try {
        const parsed = JSON.parse(savedSpaces);
        // Convert string dates back to Date objects
        return parsed.map((space: any) => ({
          ...space,
          createdAt: new Date(space.createdAt),
          tasks: space.tasks
            ? space.tasks.map((task: any) => ({
                ...task,
                createdAt: new Date(task.createdAt),
                dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                subtasks: task.subtasks
                  ? task.subtasks.map((subtask: any) => ({
                      ...subtask,
                      createdAt: new Date(subtask.createdAt),
                    }))
                  : [],
              }))
            : [],
          // Add subspaces array if not present in saved data
          subspaces: space.subspaces
            ? space.subspaces.map((subspace: any) => ({
                ...subspace,
                createdAt: new Date(subspace.createdAt),
                tasks: subspace.tasks
                  ? subspace.tasks.map((task: any) => ({
                      ...task,
                      createdAt: new Date(task.createdAt),
                      dueDate: task.dueDate
                        ? new Date(task.dueDate)
                        : undefined,
                      subtasks: task.subtasks
                        ? task.subtasks.map((subtask: any) => ({
                            ...subtask,
                            createdAt: new Date(subtask.createdAt),
                          }))
                        : [],
                    }))
                  : [],
              }))
            : [],
        }));
      } catch (e) {
        console.error("Failed to parse saved data:", e);
        // If parsing fails, return default
        return getDefaultSpaces();
      }
    }
    return getDefaultSpaces();
  });

  function getDefaultSpaces() {
    return [
      {
        id: "default",
        name: "Default Space",
        description: "This is your default space for tasks.",
        tasks: [],
        subspaces: [],
        createdAt: new Date(),
      },
    ];
  }

  const { toast } = useToast();

  // Save to localStorage whenever spaces change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(spaces));
  }, [spaces]);

  const createSpace = useCallback(
    (name: string) => {
      if (!name.trim()) return;

      setSpaces((prev) => [
        ...prev,
        {
          id: uuidv4(),
          name,
          tasks: [],
          subspaces: [],
          createdAt: new Date(),
        },
      ]);
      toast({ description: "Space created successfully" });
    },
    [toast]
  );

  const updateSpace = useCallback(
    (id: string, updates: Partial<Space>) => {
      setSpaces((prev) =>
        prev.map((space) =>
          space.id === id ? { ...space, ...updates } : space
        )
      );
      toast({ description: "Space updated successfully" });
    },
    [toast]
  );

  const deleteSpace = useCallback(
    (id: string) => {
      setSpaces((prev) => prev.filter((space) => space.id !== id));
      toast({ description: "Space deleted successfully" });
    },
    [toast]
  );

  // Subspace operations
  const createSubspace = useCallback(
    (parentId: string, name: string, description?: string) => {
      if (!name.trim()) return;

      const newSubspace: Subspace = {
        id: uuidv4(),
        name,
        description,
        parentId,
        tasks: [],
        createdAt: new Date(),
      };

      setSpaces((prev) =>
        prev.map((space) => {
          if (space.id === parentId) {
            return {
              ...space,
              subspaces: [...space.subspaces, newSubspace],
            };
          }
          return space;
        })
      );
      toast({ description: "Subspace created successfully" });
    },
    [toast]
  );

  const updateSubspace = useCallback(
    (parentId: string, subspaceId: string, updates: Partial<Subspace>) => {
      setSpaces((prev) =>
        prev.map((space) => {
          if (space.id === parentId) {
            return {
              ...space,
              subspaces: space.subspaces.map((subspace) =>
                subspace.id === subspaceId
                  ? { ...subspace, ...updates }
                  : subspace
              ),
            };
          }
          return space;
        })
      );
      toast({ description: "Subspace updated successfully" });
    },
    [toast]
  );

  const deleteSubspace = useCallback(
    (parentId: string, subspaceId: string) => {
      setSpaces((prev) =>
        prev.map((space) => {
          if (space.id === parentId) {
            return {
              ...space,
              subspaces: space.subspaces.filter(
                (subspace) => subspace.id !== subspaceId
              ),
            };
          }
          return space;
        })
      );
      toast({ description: "Subspace deleted successfully" });
    },
    [toast]
  );

  // Task operations - with support for subspaces
  const createTask = useCallback(
    (
      spaceId: string,
      title: string,
      description: string,
      dueDate?: Date,
      priority: Priority = "medium",
      subspaceId?: string
    ) => {
      if (!title.trim()) return;

      const newTask: Task = {
        id: uuidv4(),
        title,
        description,
        completed: false,
        createdAt: new Date(),
        dueDate,
        priority,
        subtasks: [],
        spaceId,
      };

      setSpaces((prev) =>
        prev.map((space) => {
          if (space.id === spaceId) {
            // If subspaceId is provided, add task to subspace
            if (subspaceId) {
              return {
                ...space,
                subspaces: space.subspaces.map((subspace) => {
                  if (subspace.id === subspaceId) {
                    return {
                      ...subspace,
                      tasks: [...subspace.tasks, newTask],
                    };
                  }
                  return subspace;
                }),
              };
            }
            // Otherwise add task directly to space
            return {
              ...space,
              tasks: [...space.tasks, newTask],
            };
          }
          return space;
        })
      );
      toast({ description: "Task created successfully" });
    },
    [toast]
  );

  const updateTask = useCallback(
    (
      spaceId: string,
      taskId: string,
      updates: Partial<Task>,
      subspaceId?: string
    ) => {
      setSpaces((prev) =>
        prev.map((space) => {
          if (space.id === spaceId) {
            if (subspaceId) {
              return {
                ...space,
                subspaces: space.subspaces.map((subspace) => {
                  if (subspace.id === subspaceId) {
                    return {
                      ...subspace,
                      tasks: subspace.tasks.map((task) => {
                        if (task.id === taskId) {
                          // Handle subtasks reordering like before
                          if (updates.subtasks) {
                            return {
                              ...task,
                              ...updates,
                              subtasks: updates.subtasks.map((subtask) => {
                                const originalSubtask = task.subtasks.find(
                                  (s) => s.id === subtask.id
                                );
                                return originalSubtask || subtask;
                              }),
                            };
                          }
                          return { ...task, ...updates };
                        }
                        return task;
                      }),
                    };
                  }
                  return subspace;
                }),
              };
            }

            // Update task in the main space
            return {
              ...space,
              tasks: space.tasks.map((task) => {
                if (task.id === taskId) {
                  if (updates.subtasks) {
                    return {
                      ...task,
                      ...updates,
                      subtasks: updates.subtasks.map((subtask) => {
                        const originalSubtask = task.subtasks.find(
                          (s) => s.id === subtask.id
                        );
                        return originalSubtask || subtask;
                      }),
                    };
                  }
                  return { ...task, ...updates };
                }
                return task;
              }),
            };
          }
          return space;
        })
      );
      toast({ description: "Task updated successfully" });
    },
    [toast]
  );

  const toggleTaskCompletion = useCallback(
    (spaceId: string, taskId: string, subspaceId?: string) => {
      setSpaces((prev) =>
        prev.map((space) => {
          if (space.id === spaceId) {
            if (subspaceId) {
              return {
                ...space,
                subspaces: space.subspaces.map((subspace) => {
                  if (subspace.id === subspaceId) {
                    return {
                      ...subspace,
                      tasks: subspace.tasks.map((task) =>
                        task.id === taskId
                          ? { ...task, completed: !task.completed }
                          : task
                      ),
                    };
                  }
                  return subspace;
                }),
              };
            }

            return {
              ...space,
              tasks: space.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, completed: !task.completed }
                  : task
              ),
            };
          }
          return space;
        })
      );
    },
    []
  );

  const deleteTask = useCallback(
    (spaceId: string, taskId: string, subspaceId?: string) => {
      setSpaces((prev) =>
        prev.map((space) => {
          if (space.id === spaceId) {
            if (subspaceId) {
              return {
                ...space,
                subspaces: space.subspaces.map((subspace) => {
                  if (subspace.id === subspaceId) {
                    return {
                      ...subspace,
                      tasks: subspace.tasks.filter(
                        (task) => task.id !== taskId
                      ),
                    };
                  }
                  return subspace;
                }),
              };
            }

            return {
              ...space,
              tasks: space.tasks.filter((task) => task.id !== taskId),
            };
          }
          return space;
        })
      );
      toast({ description: "Task deleted successfully" });
    },
    [toast]
  );

  // Subtask operations with support for subspaces
  const createSubtask = useCallback(
    (spaceId: string, taskId: string, title: string, subspaceId?: string) => {
      setSpaces((prev) =>
        prev.map((space) => {
          if (space.id === spaceId) {
            if (subspaceId) {
              return {
                ...space,
                subspaces: space.subspaces.map((subspace) => {
                  if (subspace.id === subspaceId) {
                    return {
                      ...subspace,
                      tasks: subspace.tasks.map((task) => {
                        if (task.id === taskId) {
                          return {
                            ...task,
                            subtasks: [
                              ...(task.subtasks || []),
                              {
                                id: uuidv4(),
                                title,
                                completed: false,
                                taskId,
                                createdAt: new Date(),
                              },
                            ],
                          };
                        }
                        return task;
                      }),
                    };
                  }
                  return subspace;
                }),
              };
            }

            return {
              ...space,
              tasks: space.tasks.map((task) => {
                if (task.id === taskId) {
                  return {
                    ...task,
                    subtasks: [
                      ...(task.subtasks || []),
                      {
                        id: uuidv4(),
                        title,
                        completed: false,
                        taskId,
                        createdAt: new Date(),
                      },
                    ],
                  };
                }
                return task;
              }),
            };
          }
          return space;
        })
      );
      toast({ description: "Subtask created successfully" });
    },
    [toast]
  );

  const deleteSubtask = useCallback(
    (
      spaceId: string,
      taskId: string,
      subtaskId: string,
      subspaceId?: string
    ) => {
      setSpaces((prev) =>
        prev.map((space) => {
          if (space.id === spaceId) {
            if (subspaceId) {
              return {
                ...space,
                subspaces: space.subspaces.map((subspace) => {
                  if (subspace.id === subspaceId) {
                    return {
                      ...subspace,
                      tasks: subspace.tasks.map((task) => {
                        if (task.id === taskId && task.subtasks) {
                          return {
                            ...task,
                            subtasks: task.subtasks.filter(
                              (subtask) => subtask.id !== subtaskId
                            ),
                          };
                        }
                        return task;
                      }),
                    };
                  }
                  return subspace;
                }),
              };
            }

            return {
              ...space,
              tasks: space.tasks.map((task) => {
                if (task.id === taskId && task.subtasks) {
                  return {
                    ...task,
                    subtasks: task.subtasks.filter(
                      (subtask) => subtask.id !== subtaskId
                    ),
                  };
                }
                return task;
              }),
            };
          }
          return space;
        })
      );
      toast({ description: "Subtask deleted successfully" });
    },
    [toast]
  );

  const toggleSubtaskCompletion = useCallback(
    (
      spaceId: string,
      taskId: string,
      subtaskId: string,
      subspaceId?: string
    ) => {
      setSpaces((prev) =>
        prev.map((space) => {
          if (space.id === spaceId) {
            if (subspaceId) {
              return {
                ...space,
                subspaces: space.subspaces.map((subspace) => {
                  if (subspace.id === subspaceId) {
                    return {
                      ...subspace,
                      tasks: subspace.tasks.map((task) => {
                        if (task.id === taskId && task.subtasks) {
                          return {
                            ...task,
                            subtasks: task.subtasks.map((subtask) => {
                              if (subtask.id === subtaskId) {
                                return {
                                  ...subtask,
                                  completed: !subtask.completed,
                                };
                              }
                              return subtask;
                            }),
                          };
                        }
                        return task;
                      }),
                    };
                  }
                  return subspace;
                }),
              };
            }

            return {
              ...space,
              tasks: space.tasks.map((task) => {
                if (task.id === taskId && task.subtasks) {
                  return {
                    ...task,
                    subtasks: task.subtasks.map((subtask) => {
                      if (subtask.id === subtaskId) {
                        return { ...subtask, completed: !subtask.completed };
                      }
                      return subtask;
                    }),
                  };
                }
                return task;
              }),
            };
          }
          return space;
        })
      );
    },
    []
  );

  return (
    <TaskContext.Provider
      value={{
        spaces,
        createSpace,
        updateSpace,
        deleteSpace,
        createSubspace,
        updateSubspace,
        deleteSubspace,
        createTask,
        updateTask,
        toggleTaskCompletion,
        deleteTask,
        createSubtask,
        deleteSubtask,
        toggleSubtaskCompletion,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider");
  }
  return context;
};
