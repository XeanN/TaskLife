export type Priority = "alta" | "media" | "baja";

export type TaskFormData = {
  title: string;
  description: string;
  priority: Priority;
  dueDate?: Date;
  labelIds: string[];
  areaId: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  done: boolean;
  dueDate?: Date;
  priority: Priority;
  labelIds: string[];
  areaId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewTask = Omit<Task, "id" | "createdAt" | "updatedAt">;
