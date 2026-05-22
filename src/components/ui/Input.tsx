import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Typography } from '@/src/components/ui/Typography';
import { useTheme } from '@/src/theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export function Input({ label, error, style, ...rest }: Props) {
  const theme = useTheme();
  return (
    <View style={[styles.wrapper, { gap: theme.spacing.xs }]}>
      <Typography variant="label" tone="secondary" uppercase>
        {label}
      </Typography>
      <TextInput
        placeholderTextColor={theme.colors.text.muted}
        accessibilityLabel={label}
        style={[
          theme.typography.body,
          {
            borderWidth: 1,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            borderRadius: theme.radius.md,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.md,
            backgroundColor: theme.colors.surface,
            color: theme.colors.text.primary,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Typography variant="caption" tone="danger">
          {error}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
});
