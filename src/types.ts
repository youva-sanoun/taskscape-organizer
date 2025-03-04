export type Priority = "low" | "medium" | "high";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  taskId: string;
  createdAt: Date;
  // Optional position field for drag and drop ordering
  position?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  priority: Priority;
  subtasks: Subtask[];
  spaceId: string;
}

export interface Subspace {
  id: string;
  name: string;
  description?: string;
  parentId: string; // ID of the parent space
  tasks: Task[];
  createdAt: Date;
}

export interface Space {
  id: string;
  name: string;
  description?: string;
  tasks: Task[];
  subspaces: Subspace[]; // New field for subspaces
  createdAt: Date;
}
