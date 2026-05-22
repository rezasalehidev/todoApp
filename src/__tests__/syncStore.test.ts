import * as api from '@/src/services/api';
import {
  __setSyncTuningForTests,
  useSyncStore,
  type FlushOutcome,
} from '@/src/store/syncStore';
import { useTaskStore } from '@/src/store/taskStore';
import type { Mutation } from '@/src/types/task';

const resetStores = () => {
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
  api.__resetApiForTests();
  __setSyncTuningForTests({ maxAttempts: 3, baseBackoffMs: 1 });
};

const handleOutcome = (mutation: Mutation, outcome: FlushOutcome) => {
  if (outcome.status === 'success') {
    if (outcome.result) useTaskStore.getState().applyServerTask(outcome.result);
    return;
  }
  if (mutation.kind !== 'delete') {
    const id = mutation.kind === 'create' ? mutation.task.id : mutation.id;
    useTaskStore.getState().setTaskSyncStatus(id, 'failed');
  }
};

const waitForQueueDrain = async () => {
  for (let i = 0; i < 100; i++) {
    const { queue, isFlushing } = useSyncStore.getState();
    if (queue.length === 0 && !isFlushing) return;
    await new Promise((r) => setTimeout(r, 10));
  }
};

describe('syncStore + taskStore integration', () => {
  beforeEach(() => {
    resetStores();
  });

  it('enqueues a create mutation and flushes it to the API', async () => {
    const task = useTaskStore.getState().addTask({ title: 'New thing' });
    expect(useSyncStore.getState().queue).toHaveLength(1);
    expect(task.syncStatus).toBe('pending');

    await useSyncStore.getState().flush(handleOutcome);

    expect(useSyncStore.getState().queue).toHaveLength(0);
    expect(useTaskStore.getState().getTaskById(task.id)?.syncStatus).toBe('synced');
  });

  it('queues mutations while offline and flushes them when reconnected', async () => {
    api.configureApi({ offline: true });
    useSyncStore.setState({ isOnline: false });

    const task = useTaskStore.getState().addTask({ title: 'Offline work' });
    useTaskStore.getState().updateTask(task.id, { priority: 'high' });

    expect(useSyncStore.getState().queue.length).toBeGreaterThanOrEqual(2);
    expect(useTaskStore.getState().getTaskById(task.id)?.syncStatus).toBe('pending');

    api.configureApi({ offline: false });
    useSyncStore.getState().setOnline(true);

    await useSyncStore.getState().flush(handleOutcome);
    await waitForQueueDrain();

    expect(useSyncStore.getState().queue).toHaveLength(0);
    expect(useTaskStore.getState().getTaskById(task.id)?.priority).toBe('high');
    expect(useTaskStore.getState().getTaskById(task.id)?.syncStatus).toBe('synced');
  });

  it('keeps the local copy when local updatedAt is newer than server reply (conflict resolution)', async () => {
    const task = useTaskStore.getState().addTask({ title: 'Original' });
    await useSyncStore.getState().flush(handleOutcome);

    // Simulate: user enqueues an edit, then immediately makes another edit
    // locally before the queued mutation lands. We model this by overriding
    // the local updatedAt to a clearly newer value than the in-flight patch.
    useTaskStore.getState().updateTask(task.id, { title: 'First edit' });
    const futureTimestamp = new Date(Date.now() + 60_000).toISOString();
    useTaskStore.setState((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === task.id ? { ...t, title: 'Second edit', updatedAt: futureTimestamp } : t,
      ),
    }));

    await useSyncStore.getState().flush(handleOutcome);
    await waitForQueueDrain();

    // The server processed "First edit" but applyServerTask should keep the
    // local "Second edit" because the local updatedAt is in the future.
    expect(useTaskStore.getState().getTaskById(task.id)?.title).toBe('Second edit');
  });

  it('drops a mutation after exceeding the retry budget and marks the task failed', async () => {
    const task = useTaskStore.getState().addTask({ title: 'Will fail' });
    api.configureApi({ failureRate: 1 });

    await useSyncStore.getState().flush(handleOutcome);

    expect(useSyncStore.getState().queue).toHaveLength(0);
    expect(useTaskStore.getState().getTaskById(task.id)?.syncStatus).toBe('failed');
  });

  it('pauses the flush when the api reports offline mid-batch', async () => {
    useTaskStore.getState().addTask({ title: 'Task A' });
    useTaskStore.getState().addTask({ title: 'Task B' });
    api.configureApi({ offline: true });

    await useSyncStore.getState().flush(handleOutcome);

    expect(useSyncStore.getState().isOnline).toBe(false);
    expect(useSyncStore.getState().queue.length).toBeGreaterThan(0);
  });
});
