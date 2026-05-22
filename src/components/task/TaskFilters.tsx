import { ScrollView, StyleSheet, View } from 'react-native';

import { Chip } from '@/src/components/ui';
import { PRIORITY_LABELS, STATUS_LABELS } from '@/src/constants/labels';
import { useTaskStore } from '@/src/store/taskStore';
import { useTheme } from '@/src/theme';
import type { TaskPriority, TaskStatus } from '@/src/types/task';

const STATUS_OPTIONS: Array<{ value: TaskStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: STATUS_LABELS.todo },
  { value: 'in_progress', label: STATUS_LABELS.in_progress },
  { value: 'done', label: STATUS_LABELS.done },
];

const PRIORITY_OPTIONS: Array<{ value: TaskPriority | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'low', label: PRIORITY_LABELS.low },
  { value: 'medium', label: PRIORITY_LABELS.medium },
  { value: 'high', label: PRIORITY_LABELS.high },
];

export function TaskFilters() {
  const theme = useTheme();
  const filters = useTaskStore((s) => s.filters);
  const setFilters = useTaskStore((s) => s.setFilters);

  const rowStyle = {
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  };

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.row, rowStyle]}
      >
        {STATUS_OPTIONS.map((option) => (
          <Chip
            key={`status-${option.value}`}
            label={option.label}
            selected={filters.status === option.value}
            onPress={() => setFilters({ status: option.value })}
          />
        ))}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.row, rowStyle]}
      >
        {PRIORITY_OPTIONS.map((option) => (
          <Chip
            key={`priority-${option.value}`}
            label={option.label}
            selected={filters.priority === option.value}
            onPress={() => setFilters({ priority: option.value })}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
