import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Typography } from '@/src/components/ui/Typography';
import { useTheme } from '@/src/theme';

type Props = {
  message?: string;
};

export function LoadingState({ message = 'Loading tasks...' }: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.container,
        { gap: theme.spacing.md, backgroundColor: theme.colors.background },
      ]}
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Typography variant="body" tone="secondary">
        {message}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
