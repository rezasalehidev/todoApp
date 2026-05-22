import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert, View } from 'react-native';

import { TaskForm } from '@/src/components/task/TaskForm';
import { EmptyState } from '@/src/components/ui';
import { useTaskStore } from '@/src/store/taskStore';
import { useTheme } from '@/src/theme';
import type { CreateTaskInput } from '@/src/types/task';

export default function EditTaskScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const task = useTaskStore((s) => s.getTaskById(id ?? ''));
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  if (!task) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Stack.Screen options={{ title: 'Task' }} />
        <EmptyState
          title="Task not found"
          message="This task may have been deleted."
          actionLabel="Go Back"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const handleSubmit = (input: CreateTaskInput) => {
    updateTask(task.id, input);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert('Delete task', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTask(task.id);
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen options={{ title: 'Edit Task' }} />
      <TaskForm
        initial={task}
        submitLabel="Save Changes"
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </View>
  );
}
