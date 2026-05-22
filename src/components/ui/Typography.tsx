import { StyleSheet, Text, type TextProps } from 'react-native';

import { useTheme } from '@/src/theme';
import type { TypographyVariant } from '@/src/theme/tokens';

type Tone =
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'inverse'
  | 'onPrimary'
  | 'danger'
  | 'brand';

type Props = TextProps & {
  variant?: TypographyVariant;
  tone?: Tone;
  align?: 'left' | 'center' | 'right';
  uppercase?: boolean;
};

export function Typography({
  variant = 'body',
  tone = 'primary',
  align,
  uppercase,
  style,
  children,
  ...rest
}: Props) {
  const theme = useTheme();
  const color =
    tone === 'brand'
      ? theme.colors.primary
      : tone === 'danger'
        ? theme.colors.text.danger
        : theme.colors.text[tone];

  return (
    <Text
      {...rest}
      style={[
        theme.typography[variant],
        { color },
        align ? { textAlign: align } : null,
        uppercase ? styles.uppercase : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  uppercase: { textTransform: 'uppercase', letterSpacing: 0.5 },
});
