import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { Link, router } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SyncIndicator } from '@/src/components/task/SyncIndicator';
import { TaskCard } from '@/src/components/task/TaskCard';
import { TaskFilters } from '@/src/components/task/TaskFilters';
import {
  EmptyState,
  ErrorBanner,
  Icon,
  LoadingState,
  SearchBar,
  Typography,
} from '@/src/components/ui';
import { useFilteredTasks } from '@/src/hooks/useFilteredTasks';
import { useTaskStore } from '@/src/store/taskStore';
import { useTheme } from '@/src/theme';
import type { Task } from '@/src/types/task';

export default function TaskListScreen() {
  const theme = useTheme();
  const hydrated = useTaskStore((s) => s.hydrated);
  const syncError = useTaskStore((s) => s.syncError);
  const filters = useTaskStore((s) => s.filters);
  const allTasks = useTaskStore((s) => s.tasks);
  const setFilters = useTaskStore((s) => s.setFilters);
  const setSyncError = useTaskStore((s) => s.setSyncError);
  const seedDemoTasks = useTaskStore((s) => s.seedDemoTasks);

  const filteredTasks = useFilteredTasks();

  useEffect(() => {
    if (hydrated && allTasks.length === 0) {
      seedDemoTasks();
    }
  }, [hydrated, allTasks.length, seedDemoTasks]);

  const renderItem: ListRenderItem<Task> = useCallback(
    ({ item, index }) => <TaskCard task={item} index={index} />,
    [],
  );

  const keyExtractor = useCallback((item: Task) => item.id, []);

  if (!hydrated) {
    return <LoadingState />;
  }

  const hasFilters =
    filters.search.length > 0 ||
    filters.status !== 'all' ||
    filters.priority !== 'all';

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <View
        style={[
          styles.header,
          {
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.md,
            paddingBottom: theme.spacing.sm,
            gap: theme.spacing.sm,
          },
        ]}
      >
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Typography variant="title">Tasks</Typography>
            <Typography variant="caption" tone="secondary">
              {filteredTasks.length} of {allTasks.length} tasks
            </Typography>
          </View>
          <Link href="/task/create" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create new task"
              hitSlop={theme.hitSlop.md}
              style={[
                styles.fab,
                theme.shadow.sm,
                {
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.radius.full,
                },
              ]}
            >
              <Icon name="plus" size={20} color={theme.colors.primaryContrast} />
            </Pressable>
          </Link>
        </View>
        <SyncIndicator />
      </View>

      <View
        style={{
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.sm,
        }}
      >
        <SearchBar
          value={filters.search}
          onChangeText={(search) => setFilters({ search })}
        />
      </View>

      <TaskFilters />

      {syncError ? (
        <View
          style={{
            paddingHorizontal: theme.spacing.lg,
            paddingBottom: theme.spacing.sm,
          }}
        >
          <ErrorBanner
            message={syncError}
            onDismiss={() => setSyncError(null)}
          />
        </View>
      ) : null}

      {filteredTasks.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'No matching tasks' : 'No tasks yet'}
          message={
            hasFilters
              ? 'Try adjusting your search or filters.'
              : 'Create your first task to get started.'
          }
          actionLabel={hasFilters ? undefined : 'Create Task'}
          onAction={hasFilters ? undefined : () => router.push('/task/create')}
        />
      ) : (
        <FlashList
          data={filteredTasks}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          estimatedItemSize={140}
          contentContainerStyle={{
            padding: theme.spacing.lg,
            paddingTop: theme.spacing.sm,
          }}
          ItemSeparatorComponent={Separator}
        />
      )}
    </SafeAreaView>
  );
}

function Separator() {
  const theme = useTheme();
  return <View style={{ height: theme.spacing.md }} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {},
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  fab: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
