
export interface Space {
  id: string;
  name: string;
  tasks: Task[];
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  spaceId: string;
  subtasks: Subtask[];
  createdAt: Date;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  taskId: string;
  createdAt: Date;
}
