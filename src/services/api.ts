/**
 * Mock backend.
 *
 * Simulates network behavior (latency, intermittent failures, offline mode)
 * so the offline-sync layer can be exercised end-to-end without a real server.
 * Swap this module for a real fetch-based client by keeping the same shape:
 *
 *   createTask(task: Task): Promise<Task>
 *   updateTask(id: string, patch: ...): Promise<Task>
 *   deleteTask(id: string): Promise<void>
 *
 * Any non-2xx response should throw — the sync queue treats thrown errors
 * as retryable (unless `code: 'fatal'`).
 */

import type { Task, UpdateTaskInput } from '@/src/types/task';

type ApiConfig = {
  // Simulated round-trip latency in ms.
  latencyMs: number;
  // 0..1 probability that any single request fails transiently.
  failureRate: number;
  // When true, all requests reject immediately with a network error.
  offline: boolean;
};

const config: ApiConfig = {
  latencyMs: 350,
  failureRate: 0,
  offline: false,
};

export function configureApi(partial: Partial<ApiConfig>) {
  Object.assign(config, partial);
}

export function getApiConfig(): Readonly<ApiConfig> {
  return { ...config };
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

class ApiError extends Error {
  code: 'network' | 'transient' | 'fatal' | 'not_found';
  constructor(code: ApiError['code'], message: string) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

export { ApiError };

async function simulateRequest<T>(execute: () => T): Promise<T> {
  if (config.offline) {
    throw new ApiError('network', 'Device is offline');
  }
  await sleep(config.latencyMs);
  if (Math.random() < config.failureRate) {
    throw new ApiError('transient', 'Simulated transient failure');
  }
  return execute();
}

// In-memory "server" state. Mirrors what a real backend would hold.
const remoteTasks = new Map<string, Task>();

export async function createTask(task: Task): Promise<Task> {
  return simulateRequest(() => {
    const stored: Task = { ...task, syncStatus: 'synced' };
    remoteTasks.set(task.id, stored);
    return stored;
  });
}

export async function updateTask(
  id: string,
  patch: UpdateTaskInput & { updatedAt: string },
): Promise<Task> {
  return simulateRequest(() => {
    const current = remoteTasks.get(id);
    if (!current) {
      throw new ApiError('not_found', `Task ${id} not found`);
    }
    // Last-write-wins via updatedAt. If the remote copy is newer, keep it.
    if (new Date(patch.updatedAt).getTime() < new Date(current.updatedAt).getTime()) {
      return current;
    }
    const updated: Task = {
      ...current,
      ...patch,
      syncStatus: 'synced',
    };
    remoteTasks.set(id, updated);
    return updated;
  });
}

export async function deleteTask(id: string): Promise<void> {
  return simulateRequest(() => {
    remoteTasks.delete(id);
  });
}

// Test helper — reset the simulated remote state between tests.
export function __resetApiForTests() {
  remoteTasks.clear();
  config.latencyMs = 0;
  config.failureRate = 0;
  config.offline = false;
}
