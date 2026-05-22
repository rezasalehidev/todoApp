import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  CreateTaskInput,
  Mutation,
  SyncStatus,
  Task,
  TaskFilters,
  TaskStatus,
  UpdateTaskInput,
} from '@/src/types/task';
import { createId } from '@/src/utils/id';
import { useSyncStore } from '@/src/store/syncStore';

type TaskStore = {
  tasks: Task[];
  filters: TaskFilters;
  hydrated: boolean;
  syncError: string | null;
  setHydrated: (value: boolean) => void;
  setSyncError: (message: string | null) => void;
  setFilters: (partial: Partial<TaskFilters>) => void;
  resetFilters: () => void;
  addTask: (input: CreateTaskInput) => Task;
  updateTask: (id: string, input: UpdateTaskInput) => void;
  deleteTask: (id: string) => void;
  cycleStatus: (id: string) => void;
  setStatus: (id: string, status: TaskStatus) => void;
  getTaskById: (id: string) => Task | undefined;
  setTaskSyncStatus: (id: string, status: SyncStatus) => void;
  applyServerTask: (task: Task) => void;
  seedDemoTasks: () => void;
};

const defaultFilters: TaskFilters = {
  search: '',
  status: 'all',
  priority: 'all',
};

const enqueue = (mutation: Mutation) => {
  useSyncStore.getState().enqueue(mutation);
};

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      filters: defaultFilters,
      hydrated: false,
      syncError: null,

      setHydrated: (value) => set({ hydrated: value }),
      setSyncError: (message) => set({ syncError: message }),

      setFilters: (partial) =>
        set((state) => ({
          filters: { ...state.filters, ...partial },
        })),

      resetFilters: () => set({ filters: defaultFilters }),

      addTask: (input) => {
        const now = new Date().toISOString();
        const task: Task = {
          id: createId(),
          title: input.title.trim(),
          description: input.description?.trim() || undefined,
          status: input.status ?? 'todo',
          priority: input.priority ?? 'medium',
          createdAt: input.createdAt ?? now,
          updatedAt: now,
          syncStatus: 'pending',
        };

        set((state) => ({ tasks: [task, ...state.tasks], syncError: null }));
        enqueue({ kind: 'create', task });
        return task;
      },

      updateTask: (id, input) => {
        const now = new Date().toISOString();
        let patch: (UpdateTaskInput & { updatedAt: string }) | null = null;

        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) return task;
            const nextTitle = input.title !== undefined ? input.title.trim() : task.title;
            const nextDescription =
              input.description !== undefined
                ? input.description.trim() || undefined
                : task.description;
            const nextStatus = input.status ?? task.status;
            const nextPriority = input.priority ?? task.priority;

            patch = {
              title: nextTitle,
              description: nextDescription,
              status: nextStatus,
              priority: nextPriority,
              updatedAt: now,
            };

            return {
              ...task,
              title: nextTitle,
              description: nextDescription,
              status: nextStatus,
              priority: nextPriority,
              updatedAt: now,
              syncStatus: 'pending',
            };
          }),
          syncError: null,
        }));

        if (patch) {
          enqueue({ kind: 'update', id, patch });
        }
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          syncError: null,
        }));
        enqueue({ kind: 'delete', id });
      },

      cycleStatus: (id) => {
        const task = get().getTaskById(id);
        if (!task) return;

        const order: TaskStatus[] = ['todo', 'in_progress', 'done'];
        const next = order[(order.indexOf(task.status) + 1) % order.length];
        get().setStatus(id, next);
      },

      setStatus: (id, status) => {
        get().updateTask(id, { status });
      },

      getTaskById: (id) => get().tasks.find((task) => task.id === id),

      setTaskSyncStatus: (id, status) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, syncStatus: status } : task,
          ),
        }));
      },

      applyServerTask: (serverTask) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== serverTask.id) return task;
            // Conflict resolution: if the local copy has been edited again since
            // we enqueued this mutation, keep local. Otherwise accept server.
            const localTime = new Date(task.updatedAt).getTime();
            const serverTime = new Date(serverTask.updatedAt).getTime();
            if (localTime > serverTime) {
              return task;
            }
            return { ...serverTask, syncStatus: 'synced' };
          }),
        }));
      },

      seedDemoTasks: () => {
        if (get().tasks.length > 0) return;

        const now = Date.now();
        const demos: CreateTaskInput[] = [
          {
            title: 'Review project architecture',
            description: 'Document folder structure and state flow',
            status: 'in_progress',
            priority: 'high',
          },
          {
            title: 'Write unit tests for filters',
            description: 'Cover search and status combinations',
            status: 'todo',
            priority: 'medium',
          },
          {
            title: 'Ship offline persistence',
            status: 'done',
            priority: 'low',
          },
        ];

        demos.forEach((demo, index) => {
          get().addTask({
            ...demo,
            createdAt: new Date(now - index * 86_400_000).toISOString(),
          });
        });
      },
    }),
    {
      name: 'expo-task-storage',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        filters: state.filters,
      }),
      migrate: (persisted: unknown, version) => {
        // v1 tasks lacked updatedAt/syncStatus — backfill them so the new
        // store invariants hold for users upgrading from the old build.
        if (version < 2 && persisted && typeof persisted === 'object') {
          const state = persisted as { tasks?: Task[] };
          if (Array.isArray(state.tasks)) {
            state.tasks = state.tasks.map((task) => ({
              ...task,
              updatedAt: task.updatedAt ?? task.createdAt,
              syncStatus: task.syncStatus ?? 'synced',
            }));
          }
        }
        return persisted as Partial<TaskStore>;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          state?.setSyncError('Failed to load saved tasks. Using empty list.');
        }
        state?.setHydrated(true);
      },
    },
  ),
);
