import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { Icon, type IconName } from '@/src/components/ui/Icon';
import { Typography } from '@/src/components/ui/Typography';
import { useTheme } from '@/src/theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

type Props = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: IconName;
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  disabled,
  ...rest
}: Props) {
  const theme = useTheme();
  const isInteractive = !disabled && !loading;

  const palette = (() => {
    switch (variant) {
      case 'primary':
        return {
          bg: theme.colors.primary,
          fg: theme.colors.text.onPrimary,
          border: 'transparent',
        };
      case 'danger':
        return {
          bg: theme.colors.danger,
          fg: theme.colors.text.onPrimary,
          border: 'transparent',
        };
      case 'secondary':
        return {
          bg: theme.colors.surface,
          fg: theme.colors.text.primary,
          border: theme.colors.border,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          fg: theme.colors.primary,
          border: 'transparent',
        };
    }
  })();

  const sizing = (() => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          textVariant: 'caption' as const,
        };
      case 'lg':
        return {
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.xl,
          textVariant: 'bodyStrong' as const,
        };
      default:
        return {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          textVariant: 'bodyStrong' as const,
        };
    }
  })();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      disabled={!isInteractive}
      hitSlop={theme.hitSlop.sm}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderRadius: theme.radius.md,
          paddingVertical: sizing.paddingVertical,
          paddingHorizontal: sizing.paddingHorizontal,
          opacity: !isInteractive ? 0.5 : pressed ? 0.85 : 1,
        },
        fullWidth && styles.fullWidth,
      ]}
      {...rest}
    >
      <View style={[styles.content, { gap: theme.spacing.sm }]}>
        {loading ? (
          <ActivityIndicator size="small" color={palette.fg} />
        ) : leftIcon ? (
          <Icon name={leftIcon} color={palette.fg} size={16} />
        ) : null}
        <Typography variant={sizing.textVariant} style={{ color: palette.fg }}>
          {label}
        </Typography>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { width: '100%' },
  content: { flexDirection: 'row', alignItems: 'center' },
});
