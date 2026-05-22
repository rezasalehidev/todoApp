import { router, Stack } from 'expo-router';

import { EmptyState } from '@/src/components/ui/EmptyState';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <EmptyState
        title="This screen doesn't exist"
        message="The page you tried to open could not be found."
        actionLabel="Go to tasks"
        onAction={() => router.replace('/')}
      />
    </>
  );
}
