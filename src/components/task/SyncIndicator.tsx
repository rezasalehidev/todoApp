import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Icon, Typography } from '@/src/components/ui';
import { useOnlineSync } from '@/src/hooks/useOnlineSync';
import { useTheme } from '@/src/theme';

export function SyncIndicator() {
  const theme = useTheme();
  const { isOnline, isFlushing, queueLength, flush } = useOnlineSync();

  const label = !isOnline
    ? 'Offline'
    : isFlushing
      ? 'Syncing'
      : queueLength > 0
        ? `${queueLength} pending`
        : 'Synced';

  const tone = !isOnline ? theme.colors.warning : theme.colors.success;
  const bg = !isOnline ? theme.colors.warningSoft : theme.colors.successSoft;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Sync status: ${label}. Tap to sync now.`}
      onPress={flush}
      hitSlop={theme.hitSlop.sm}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: bg,
          borderRadius: theme.radius.full,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs,
          gap: theme.spacing.xs,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.iconWrap}>
        {isFlushing ? (
          <ActivityIndicator size="small" color={tone} />
        ) : (
          <Icon
            name={isOnline ? 'cloud' : 'exclamation-circle'}
            size={14}
            color={tone}
          />
        )}
      </View>
      <Typography variant="label" style={{ color: tone }}>
        {label}
      </Typography>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  iconWrap: { width: 14, alignItems: 'center', justifyContent: 'center' },
});
