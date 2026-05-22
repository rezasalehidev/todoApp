import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/src/components/ui/Typography';
import { useTheme } from '@/src/theme';

type Props = {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
};

export function ErrorBanner({ message, onDismiss, onRetry }: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: theme.colors.dangerSoft,
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
          gap: theme.spacing.sm,
        },
      ]}
    >
      <Typography variant="caption" tone="danger">
        {message}
      </Typography>
      <View style={[styles.actions, { gap: theme.spacing.md }]}>
        {onRetry ? (
          <Pressable onPress={onRetry} hitSlop={theme.hitSlop.sm} accessibilityRole="button">
            <Typography variant="caption" tone="danger" style={styles.bold}>
              Retry
            </Typography>
          </Pressable>
        ) : null}
        {onDismiss ? (
          <Pressable onPress={onDismiss} hitSlop={theme.hitSlop.sm} accessibilityRole="button">
            <Typography variant="caption" tone="danger" style={styles.bold}>
              Dismiss
            </Typography>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {},
  actions: { flexDirection: 'row' },
  bold: { fontWeight: '700' },
});
