import { router, Stack } from 'expo-router';
import { View } from 'react-native';

import { TaskForm } from '@/src/components/task/TaskForm';
import { useTaskStore } from '@/src/store/taskStore';
import { useTheme } from '@/src/theme';
import type { CreateTaskInput } from '@/src/types/task';

export default function CreateTaskScreen() {
  const theme = useTheme();
  const addTask = useTaskStore((s) => s.addTask);

  const handleSubmit = (input: CreateTaskInput) => {
    addTask(input);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen options={{ title: 'New Task', presentation: 'modal' }} />
      <TaskForm submitLabel="Create Task" onSubmit={handleSubmit} />
    </View>
  );
}
