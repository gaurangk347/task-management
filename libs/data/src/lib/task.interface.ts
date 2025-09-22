export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  DONE = 'done',
}

export enum TaskCategory {
  WORK = 'work',
  PERSONAL = 'personal',
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  category: TaskCategory;
  assigneeId: string;
  organizationId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  // Optional relation loaded by API for owner/admin views
  assignee?: {
    id: string;
    email: string;
  };
  creator?: {
    id: string;
    email: string;
  };
}

export interface CreateTaskDto {
  title: string;
  description: string;
  category: TaskCategory;
  assigneeId: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  category?: TaskCategory;
  assigneeId?: string;
}
