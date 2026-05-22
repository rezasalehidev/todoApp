import { Pressable, StyleSheet } from 'react-native';

import { Typography } from '@/src/components/ui/Typography';
import { useTheme } from '@/src/theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function Chip({ label, selected = false, onPress, accessibilityLabel }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={theme.hitSlop.sm}
      style={({ pressed }) => [
        styles.chip,
        {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.radius.full,
          borderWidth: 1,
          backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surfaceMuted,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Typography variant="caption" tone={selected ? 'brand' : 'secondary'}>
        {label}
      </Typography>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { alignSelf: 'flex-start' },
});
