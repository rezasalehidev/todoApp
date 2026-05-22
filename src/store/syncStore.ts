import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import * as api from '@/src/services/api';
import type { Mutation, Task } from '@/src/types/task';

export type QueuedMutation = {
  id: string;
  mutation: Mutation;
  attempts: number;
  lastError?: string;
  enqueuedAt: string;
};

export type FlushOutcome =
  | { status: 'success'; result?: Task }
  | { status: 'failed'; error: string };

type SyncStore = {
  queue: QueuedMutation[];
  isOnline: boolean;
  isFlushing: boolean;
  lastSyncedAt: string | null;
  lastError: string | null;

  setOnline: (value: boolean) => void;
  enqueue: (mutation: Mutation) => void;
  removeFromQueue: (mutationId: string) => void;
  flush: (
    onMutationApplied?: (mutation: Mutation, outcome: FlushOutcome) => void,
  ) => Promise<void>;
};

// Tunable constants — defaults are production-friendly. Tests can override
// via `__setSyncTuningForTests` to keep the suite fast.
const tuning = {
  maxAttempts: 5,
  baseBackoffMs: 500,
};

export function __setSyncTuningForTests(partial: Partial<typeof tuning>) {
  Object.assign(tuning, partial);
}

const newQueueId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const useSyncStore = create<SyncStore>()(
  persist(
    (set, get) => ({
      queue: [],
      isOnline: true,
      isFlushing: false,
      lastSyncedAt: null,
      lastError: null,

      setOnline: (value) => {
        set({ isOnline: value });
      },

      enqueue: (mutation) => {
        const entry: QueuedMutation = {
          id: newQueueId(),
          mutation,
          attempts: 0,
          enqueuedAt: new Date().toISOString(),
        };
        set((state) => ({ queue: [...state.queue, entry] }));
      },

      removeFromQueue: (mutationId) => {
        set((state) => ({ queue: state.queue.filter((m) => m.id !== mutationId) }));
      },

      flush: async (onMutationApplied) => {
        const { isFlushing, isOnline } = get();
        if (isFlushing || !isOnline) {
          return;
        }
        set({ isFlushing: true, lastError: null });

        try {
          // Always read the latest queue from state in case it was appended to mid-flush.
          while (true) {
            const next = get().queue[0];
            if (!next) break;

            try {
              const result = await applyMutation(next.mutation);
              set((state) => ({
                queue: state.queue.slice(1),
                lastSyncedAt: new Date().toISOString(),
              }));
              onMutationApplied?.(next.mutation, {
                status: 'success',
                result: result ?? undefined,
              });
            } catch (err) {
              const attempts = next.attempts + 1;
              const message = err instanceof Error ? err.message : String(err);

              // Network failures stop the flush — we'll resume when reconnected.
              // Transient failures retry with backoff up to maxAttempts.
              // Fatal failures (e.g. not_found) drop the mutation.
              const isNetwork =
                err instanceof api.ApiError && err.code === 'network';
              const isFatal =
                err instanceof api.ApiError &&
                (err.code === 'fatal' || err.code === 'not_found');

              if (isFatal || attempts >= tuning.maxAttempts) {
                set((state) => ({
                  queue: state.queue.slice(1),
                  lastError: message,
                }));
                onMutationApplied?.(next.mutation, { status: 'failed', error: message });
                continue;
              }

              set((state) => ({
                queue: [
                  { ...state.queue[0], attempts, lastError: message },
                  ...state.queue.slice(1),
                ],
                lastError: message,
              }));

              if (isNetwork) {
                set({ isOnline: false });
                break;
              }

              await sleep(tuning.baseBackoffMs * 2 ** (attempts - 1));
            }
          }
        } finally {
          set({ isFlushing: false });
        }
      },
    }),
    {
      name: 'expo-task-sync-queue',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ queue: state.queue, lastSyncedAt: state.lastSyncedAt }),
    },
  ),
);

async function applyMutation(mutation: Mutation): Promise<Task | void> {
  switch (mutation.kind) {
    case 'create':
      return api.createTask(mutation.task);
    case 'update':
      return api.updateTask(mutation.id, mutation.patch);
    case 'delete':
      await api.deleteTask(mutation.id);
      return;
  }
}
