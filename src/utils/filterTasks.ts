import type { Task, TaskFilters } from '@/src/types/task';

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  const query = filters.search.trim().toLowerCase();

  return tasks
    .filter((task) => {
      if (filters.status !== 'all' && task.status !== filters.status) {
        return false;
      }
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }
      if (!query) return true;

      const haystack = [task.title, task.description ?? '']
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}
