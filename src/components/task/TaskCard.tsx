import * as Haptics from 'expo-haptics';
import { Link } from 'expo-router';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Badge, Icon, Typography } from '@/src/components/ui';
import { PRIORITY_LABELS, STATUS_LABELS } from '@/src/constants/labels';
import { useTaskStore } from '@/src/store/taskStore';
import { useTheme } from '@/src/theme';
import type { Task } from '@/src/types/task';

type Props = {
  task: Task;
  index: number;
};

const SYNC_LABEL: Record<Exclude<Task['syncStatus'], 'synced'>, string> = {
  pending: 'Syncing…',
  failed: 'Sync failed',
};

function TaskCardComponent({ task, index }: Props) {
  const theme = useTheme();
  const cycleStatus = useTaskStore((s) => s.cycleStatus);
  const statusStyle = theme.colors.status[task.status];
  const priorityStyle = theme.colors.priority[task.priority];

  const handleCycleStatus = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    cycleStatus(task.id);
  }, [cycleStatus, task.id]);

  const syncBadge =
    task.syncStatus === 'synced'
      ? null
      : theme.colors.sync[task.syncStatus];

  return (
    <Animated.View
      entering={FadeInDown.delay(index * theme.motion.delays.listItem).springify()}
    >
      <View
        style={[
          styles.card,
          theme.shadow.sm,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.lg,
            padding: theme.spacing.lg,
            gap: theme.spacing.md,
          },
        ]}
      >
        <View style={[styles.header, { gap: theme.spacing.sm }]}>
          <Link href={`/task/${task.id}`} asChild>
            <Pressable
              style={[styles.content, { gap: theme.spacing.xs }]}
              accessibilityRole="button"
              accessibilityLabel={`Edit task ${task.title}`}
            >
              <Typography variant="subheading" numberOfLines={1}>
                {task.title}
              </Typography>
              {task.description ? (
                <Typography variant="body" tone="secondary" numberOfLines={2}>
                  {task.description}
                </Typography>
              ) : null}
              <Typography variant="caption" tone="muted">
                {new Date(task.createdAt).toLocaleDateString()}
              </Typography>
            </Pressable>
          </Link>
          <Pressable
            onPress={handleCycleStatus}
            accessibilityRole="button"
            accessibilityLabel={`Cycle status for ${task.title}`}
            hitSlop={theme.hitSlop.md}
            style={[
              styles.statusButton,
              {
                padding: theme.spacing.sm,
                borderRadius: theme.radius.full,
                backgroundColor: theme.colors.primarySoft,
              },
            ]}
          >
            <Icon name="refresh" size={18} tone="brand" />
          </Pressable>
        </View>
        <View style={[styles.badges, { gap: theme.spacing.sm }]}>
          <Badge
            label={STATUS_LABELS[task.status]}
            backgroundColor={statusStyle.bg}
            textColor={statusStyle.fg}
          />
          <Badge
            label={PRIORITY_LABELS[task.priority]}
            backgroundColor={priorityStyle.bg}
            textColor={priorityStyle.fg}
          />
          {syncBadge ? (
            <Badge
              label={SYNC_LABEL[task.syncStatus as 'pending' | 'failed']}
              backgroundColor={syncBadge.bg}
              textColor={syncBadge.fg}
            />
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
  header: { flexDirection: 'row', alignItems: 'flex-start' },
  content: { flex: 1 },
  statusButton: {},
  badges: { flexDirection: 'row', flexWrap: 'wrap' },
});

export const TaskCard = memo(TaskCardComponent, (prev, next) => {
  return (
    prev.index === next.index &&
    prev.task.id === next.task.id &&
    prev.task.title === next.task.title &&
    prev.task.description === next.task.description &&
    prev.task.status === next.task.status &&
    prev.task.priority === next.task.priority &&
    prev.task.createdAt === next.task.createdAt &&
    prev.task.updatedAt === next.task.updatedAt &&
    prev.task.syncStatus === next.task.syncStatus
  );
});
