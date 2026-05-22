import { StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/ui/Button';
import { Icon, type IconName } from '@/src/components/ui/Icon';
import { Typography } from '@/src/components/ui/Typography';
import { useTheme } from '@/src/theme';

type Props = {
  title: string;
  message: string;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title,
  message,
  icon = 'inbox',
  actionLabel,
  onAction,
}: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.container,
        { padding: theme.spacing.xl, gap: theme.spacing.md },
      ]}
    >
      <Icon name={icon} size={48} tone="muted" />
      <Typography variant="heading" align="center">
        {title}
      </Typography>
      <Typography variant="body" tone="secondary" align="center">
        {message}
      </Typography>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} />
      ) : null}
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
