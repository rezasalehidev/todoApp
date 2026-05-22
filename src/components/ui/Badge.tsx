import { StyleSheet, View } from 'react-native';

import { Typography } from '@/src/components/ui/Typography';
import { useTheme } from '@/src/theme';

type Props = {
  label: string;
  backgroundColor: string;
  textColor: string;
};

export function Badge({ label, backgroundColor, textColor }: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
          borderRadius: theme.radius.full,
        },
      ]}
    >
      <Typography variant="label" style={{ color: textColor }}>
        {label}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start' },
});
