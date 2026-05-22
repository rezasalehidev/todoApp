import { useMemo } from 'react';

import { useTaskStore } from '@/src/store/taskStore';
import { filterTasks } from '@/src/utils/filterTasks';

export function useFilteredTasks() {
  const tasks = useTaskStore((s) => s.tasks);
  const filters = useTaskStore((s) => s.filters);

  return useMemo(() => filterTasks(tasks, filters), [tasks, filters]);
}
