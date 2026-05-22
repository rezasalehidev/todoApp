import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Button, Chip, Input, Typography } from '@/src/components/ui';
import { PRIORITY_LABELS, STATUS_LABELS } from '@/src/constants/labels';
import { useTheme } from '@/src/theme';
import type { CreateTaskInput, Task, TaskPriority, TaskStatus } from '@/src/types/task';

type Props = {
  initial?: Task;
  submitLabel: string;
  onSubmit: (input: CreateTaskInput) => void;
  onDelete?: () => void;
};

export function TaskForm({ initial, submitLabel, onSubmit, onDelete }: Props) {
  const theme = useTheme();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? 'todo');
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? 'medium');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError('Title is required');
      return;
    }
    setError(null);
    onSubmit({
      title: trimmed,
      description: description.trim() || undefined,
      status,
      priority,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          padding: theme.spacing.lg,
          gap: theme.spacing.lg,
          paddingBottom: theme.spacing.xxl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="What needs to be done?"
          error={error ?? undefined}
        />
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Optional details"
          multiline
          numberOfLines={4}
          style={styles.multiline}
        />

        <View style={[styles.section, { gap: theme.spacing.sm }]}>
          <Typography variant="label" tone="secondary" uppercase>
            Status
          </Typography>
          <View style={[styles.chips, { gap: theme.spacing.sm }]}>
            {(['todo', 'in_progress', 'done'] as TaskStatus[]).map((value) => (
              <Chip
                key={value}
                label={STATUS_LABELS[value]}
                selected={status === value}
                onPress={() => setStatus(value)}
              />
            ))}
          </View>
        </View>

        <View style={[styles.section, { gap: theme.spacing.sm }]}>
          <Typography variant="label" tone="secondary" uppercase>
            Priority
          </Typography>
          <View style={[styles.chips, { gap: theme.spacing.sm }]}>
            {(['low', 'medium', 'high'] as TaskPriority[]).map((value) => (
              <Chip
                key={value}
                label={PRIORITY_LABELS[value]}
                selected={priority === value}
                onPress={() => setPriority(value)}
              />
            ))}
          </View>
        </View>

        <Button label={submitLabel} onPress={handleSubmit} fullWidth />
        {onDelete ? (
          <Button
            label="Delete Task"
            variant="danger"
            leftIcon="trash"
            onPress={onDelete}
            fullWidth
          />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  section: {},
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
});
