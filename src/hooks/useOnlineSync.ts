import NetInfo from '@react-native-community/netinfo';
import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useSyncStore } from '@/src/store/syncStore';
import { useTaskStore } from '@/src/store/taskStore';

/**
 * Bridges network/app-foreground events to the mutation queue.
 *
 * - Listens to NetInfo and toggles `isOnline`.
 * - Calls `flush()` when reconnecting, when the app foregrounds, and once on mount.
 * - Translates per-mutation results back into local task state:
 *   - success → `applyServerTask` (server is authoritative on conflicts via updatedAt)
 *   - failure (queue drop) → mark the task as `failed` so the UI can show it
 */
export function useOnlineSync() {
  const isOnline = useSyncStore((s) => s.isOnline);
  const isFlushing = useSyncStore((s) => s.isFlushing);
  const queueLength = useSyncStore((s) => s.queue.length);
  const flush = useSyncStore((s) => s.flush);
  const setOnline = useSyncStore((s) => s.setOnline);
  const applyServerTask = useTaskStore((s) => s.applyServerTask);
  const setTaskSyncStatus = useTaskStore((s) => s.setTaskSyncStatus);

  const flushRef = useRef(flush);
  flushRef.current = flush;

  const triggerFlush = useCallback(() => {
    flushRef.current((mutation, outcome) => {
      if (outcome.status === 'success') {
        if (outcome.result) {
          applyServerTask(outcome.result);
        }
        return;
      }
      // Failure path — surface it on the task so the UI can show a "failed" badge.
      if (mutation.kind !== 'delete') {
        const id = mutation.kind === 'create' ? mutation.task.id : mutation.id;
        setTaskSyncStatus(id, 'failed');
      }
    });
  }, [applyServerTask, setTaskSyncStatus]);

  // NetInfo subscription.
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      setOnline(online);
    });
    NetInfo.fetch().then((state) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      setOnline(online);
    });
    return unsubscribe;
  }, [setOnline]);

  // AppState — flush when app comes back to the foreground.
  useEffect(() => {
    const handleChange = (status: AppStateStatus) => {
      if (status === 'active') {
        triggerFlush();
      }
    };
    const sub = AppState.addEventListener('change', handleChange);
    return () => sub.remove();
  }, [triggerFlush]);

  // Flush whenever we transition to online (or queue gets work while online).
  useEffect(() => {
    if (isOnline && !isFlushing && queueLength > 0) {
      triggerFlush();
    }
  }, [isOnline, isFlushing, queueLength, triggerFlush]);

  return { isOnline, isFlushing, queueLength, flush: triggerFlush };
}
