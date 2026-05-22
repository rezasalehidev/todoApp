import { filterTasks } from '@/src/utils/filterTasks';
import type { Task } from '@/src/types/task';

const baseTask: Task = {
  id: '1',
  title: 'Build offline cache',
  description: 'Persist tasks with AsyncStorage',
  status: 'in_progress',
  priority: 'high',
  createdAt: '2026-05-20T10:00:00.000Z',
  updatedAt: '2026-05-20T10:00:00.000Z',
  syncStatus: 'synced',
};

const tasks: Task[] = [
  baseTask,
  {
    id: '2',
    title: 'Write tests',
    status: 'todo',
    priority: 'medium',
    createdAt: '2026-05-21T10:00:00.000Z',
    updatedAt: '2026-05-21T10:00:00.000Z',
    syncStatus: 'synced',
  },
  {
    id: '3',
    title: 'Ship release',
    status: 'done',
    priority: 'low',
    createdAt: '2026-05-19T10:00:00.000Z',
    updatedAt: '2026-05-19T10:00:00.000Z',
    syncStatus: 'synced',
  },
];

describe('filterTasks', () => {
  it('filters by search query across title and description', () => {
    const result = filterTasks(tasks, {
      search: 'offline',
      status: 'all',
      priority: 'all',
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('filters by status and priority', () => {
    const result = filterTasks(tasks, {
      search: '',
      status: 'todo',
      priority: 'medium',
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('sorts by newest createdAt first', () => {
    const result = filterTasks(tasks, {
      search: '',
      status: 'all',
      priority: 'all',
    });

    expect(result.map((t) => t.id)).toEqual(['2', '1', '3']);
  });
});
