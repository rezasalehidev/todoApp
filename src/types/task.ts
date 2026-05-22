export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type SyncStatus = 'synced' | 'pending' | 'failed';

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
};

export type TaskFilters = {
  search: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  createdAt?: string;
};

export type UpdateTaskInput = Partial<
  Pick<Task, 'title' | 'description' | 'status' | 'priority'>
>;

export type Mutation =
  | { kind: 'create'; task: Task }
  | { kind: 'update'; id: string; patch: UpdateTaskInput & { updatedAt: string } }
  | { kind: 'delete'; id: string };
