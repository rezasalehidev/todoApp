# Expo Task Manager

A React Native task manager built with **Expo**, **TypeScript**, and **Yarn**. Tasks are created, edited, filtered, and persisted offline, then synchronized to a (mock) remote backend through a retrying mutation queue.

## Features

- View, create, edit, and delete tasks
- Cycle task status with one tap (todo → in progress → done)
- Search by title/description
- Filter by status and priority
- Offline-first persistence via AsyncStorage
- Offline sync queue with retry, backoff, and conflict resolution
- Optimistic UI updates (local state changes first, sync runs in background)
- Per-task sync status badges (pending / failed / synced)
- Theming via a typed `ThemeProvider` — light & dark themes follow the OS
- Loading, empty, and error states
- List animations (Reanimated) and haptic feedback on status change
- Unit tests for filter logic, task store, and sync queue

## Tech Stack

| Area | Choice |
|------|--------|
| Framework | Expo SDK 54 + Expo Router |
| Language | TypeScript (strict) |
| Package manager | Yarn |
| State | Zustand (taskStore + syncStore) with `persist` middleware |
| Storage | `@react-native-async-storage/async-storage` |
| Network detection | `@react-native-community/netinfo` |
| Lists | `@shopify/flash-list` |
| Animations | `react-native-reanimated` |

## Project Structure

```
app/                        # Expo Router screens
  index.tsx                 # Task list (root route)
  task/create.tsx           # Create task (modal)
  task/[id].tsx             # Edit task
  +not-found.tsx            # 404 fallback
src/
  components/
    ui/                     # Design-system primitives (Button, Chip, Input,
                            # SearchBar, Badge, Typography, Icon, EmptyState,
                            # ErrorBanner, LoadingState) + barrel export
    task/                   # Task-feature components (TaskCard, TaskForm,
                            # TaskFilters, SyncIndicator)
  constants/                # Labels and status helpers
  hooks/
    useFilteredTasks.ts     # Memoised filtering hook
    useOnlineSync.ts        # NetInfo + AppState -> mutation queue bridge
  services/
    api.ts                  # Mock backend (latency + failure simulation)
  store/
    taskStore.ts            # Tasks, filters, hydration, optimistic mutations
    syncStore.ts            # Mutation queue, retry/backoff, persistence
  theme/
    tokens.ts               # Raw tokens (palette, spacing, radius, typography,
                            # motion, hitSlop)
    themes.ts               # Light/dark semantic themes built from tokens
    ThemeProvider.tsx       # Provider + useTheme/useThemeName hooks
    index.ts                # Barrel
  types/task.ts             # Shared types (Task, Mutation, SyncStatus, …)
  utils/                    # Pure helpers (filterTasks, id)
  __tests__/                # Jest unit tests
```

## Architecture Decisions

### State management

Two Zustand stores, separated by responsibility:

- **`taskStore`** — domain state (tasks, filters, hydration). All CRUD operations are optimistic: state updates first, then a mutation is enqueued.
- **`syncStore`** — transport state (mutation queue, online flag, flush in-progress, last sync timestamp, last error). Persisted separately to AsyncStorage so the queue survives app kills.

This separation keeps the domain logic free of network concerns and makes the sync layer easy to swap or upgrade.

### Offline sync strategy

Local-first with a durable mutation queue:

1. CRUD action runs against `taskStore` immediately → UI updates with `syncStatus: 'pending'`.
2. The store enqueues a typed `Mutation` (`create` / `update` / `delete`) on `syncStore`.
3. `useOnlineSync()` listens to NetInfo + AppState. When the app is foregrounded or the device comes back online, it calls `flush()`.
4. `flush()` walks the queue in order:
   - **Success** → server result is applied via `applyServerTask`, which uses `updatedAt`-based last-write-wins to resolve conflicts (newer local edits win over stale server replies).
   - **Transient failure** → retry with exponential backoff (`500ms · 2^attempt`, up to 5 attempts).
   - **Network failure** → stop flushing, mark `isOnline: false`, resume on reconnect.
   - **Fatal failure** (e.g. `404`) or **retry budget exhausted** → drop the mutation, mark the task `failed` so the UI can surface it (tap the sync pill to retry).
5. Both the task store and the sync queue are persisted, so closing the app mid-sync is safe.

The mock backend in `src/services/api.ts` exposes a `configureApi({ offline, latencyMs, failureRate })` knob so you can exercise every branch from a debugger. Swap this file for a real `fetch`-based client and the rest of the stack is unchanged.

### Design system

- **Raw tokens** (`src/theme/tokens.ts`) — `palette`, `spacing`, `radius`, `typography`, `motion`, `hitSlop`. These never appear in components directly.
- **Semantic themes** (`src/theme/themes.ts`) — `lightTheme` and `darkTheme` map tokens to roles: `colors.surface`, `colors.text.primary`, `colors.status.in_progress.bg`, `colors.sync.failed.fg`, `shadow.sm`, etc. Components read from the semantic theme via `useTheme()`.
- **`ThemeProvider`** — follows `useColorScheme()` automatically, accepts `forceName` for tests/screenshots, and bridges to React Navigation's theme so navigation surfaces match.
- **Primitive components** in `src/components/ui` (barrel-exported) — `Typography`, `Icon`, `Button` (variants + sizes + `loading`), `Chip`, `Input`, `SearchBar`, `Badge`, `EmptyState`, `ErrorBanner`, `LoadingState`. All consume the semantic theme, all use token-driven spacing/radius/typography, all have proper `accessibilityRole`s and `hitSlop`.
- **Icon system** — `<Icon name="…">` wraps `@expo/vector-icons` with a typed name list so icon usage is centralised and swappable.

### Navigation

File-based routing via Expo Router. The list lives at the root; create/edit are stack screens, with create presented modally.

### Performance

- `FlashList` for efficient scrolling with large lists.
- `TaskCard` is `React.memo` with a field-level comparator so unrelated store updates don't re-render every row.
- `renderItem`, `keyExtractor`, and `ItemSeparatorComponent` are stable references.
- `useFilteredTasks` memoises filtered/sorted results.
- Fine-grained Zustand selectors keep re-renders narrow.

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn 1.x or Berry
- iOS Simulator, Android Emulator, or Expo Go

### Install

```bash
yarn install
```

### Run

```bash
yarn start
```

Then press `i` for iOS, `a` for Android, or scan the QR code with Expo Go.

Platform shortcuts:

```bash
yarn ios
yarn android
yarn web
```

### Scripts

| Command | Description |
|---------|-------------|
| `yarn start` | Start Expo dev server |
| `yarn test` | Run Jest tests |
| `yarn typecheck` | TypeScript check |

## Task Model

```ts
type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'failed';
};
```

The challenge spec defines the first six fields; `updatedAt` and `syncStatus` are added to power offline sync and conflict resolution. Persisted state from older builds is migrated automatically (see `taskStore.ts` → `migrate`).

## Future Enhancements

- Real backend (drop-in replace `src/services/api.ts`)
- Pull-to-refresh that re-fetches the server snapshot
- Per-mutation undo (compensation queue)
- E2E tests with Detox or Maestro
- Component showcase / Storybook for the design system

## License

MIT
