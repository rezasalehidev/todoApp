import { useSyncStore } from '@/src/store/syncStore';
import { useTaskStore } from '@/src/store/taskStore';

const resetStore = () => {
  useTaskStore.setState({
    tasks: [],
    filters: { search: '', status: 'all', priority: 'all' },
    hydrated: true,
    syncError: null,
  });
  useSyncStore.setState({
    queue: [],
    isOnline: true,
    isFlushing: false,
    lastSyncedAt: null,
    lastError: null,
  });
};

describe('taskStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('adds a task with sensible defaults, sync status, and trims whitespace', () => {
    const task = useTaskStore.getState().addTask({ title: '  Buy milk  ' });

    expect(task.title).toBe('Buy milk');
    expect(task.status).toBe('todo');
    expect(task.priority).toBe('medium');
    expect(task.syncStatus).toBe('pending');
    expect(task.updatedAt).toBeTruthy();
    expect(task.id).toBeTruthy();
    expect(useTaskStore.getState().tasks).toHaveLength(1);
  });

  it('updates a task and trims fields', () => {
    const task = useTaskStore.getState().addTask({ title: 'Original' });

    useTaskStore.getState().updateTask(task.id, {
      title: '  New title  ',
      description: '  details  ',
      priority: 'high',
    });

    const updated = useTaskStore.getState().getTaskById(task.id);
    expect(updated?.title).toBe('New title');
    expect(updated?.description).toBe('details');
    expect(updated?.priority).toBe('high');
  });

  it('deletes a task', () => {
    const task = useTaskStore.getState().addTask({ title: 'Throwaway' });
    useTaskStore.getState().deleteTask(task.id);

    expect(useTaskStore.getState().tasks).toHaveLength(0);
  });

  it('cycles status todo -> in_progress -> done -> todo', () => {
    const task = useTaskStore.getState().addTask({ title: 'Cycle me' });

    useTaskStore.getState().cycleStatus(task.id);
    expect(useTaskStore.getState().getTaskById(task.id)?.status).toBe('in_progress');

    useTaskStore.getState().cycleStatus(task.id);
    expect(useTaskStore.getState().getTaskById(task.id)?.status).toBe('done');

    useTaskStore.getState().cycleStatus(task.id);
    expect(useTaskStore.getState().getTaskById(task.id)?.status).toBe('todo');
  });

  it('merges filters partially via setFilters', () => {
    useTaskStore.getState().setFilters({ search: 'milk' });
    expect(useTaskStore.getState().filters).toEqual({
      search: 'milk',
      status: 'all',
      priority: 'all',
    });

    useTaskStore.getState().setFilters({ status: 'done' });
    expect(useTaskStore.getState().filters.status).toBe('done');
    expect(useTaskStore.getState().filters.search).toBe('milk');
  });

  it('seeds demo tasks only when the list is empty', () => {
    useTaskStore.getState().seedDemoTasks();
    const seededCount = useTaskStore.getState().tasks.length;
    expect(seededCount).toBeGreaterThan(0);

    useTaskStore.getState().seedDemoTasks();
    expect(useTaskStore.getState().tasks).toHaveLength(seededCount);
  });
});
