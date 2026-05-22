import { StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/src/components/ui/Icon';
import { useTheme } from '@/src/theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search tasks...',
}: Props) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.container,
        {
          gap: theme.spacing.sm,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
        },
      ]}
    >
      <Icon name="search" size={16} tone="muted" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.muted}
        accessibilityLabel="Search tasks"
        style={[
          styles.input,
          theme.typography.body,
          {
            color: theme.colors.text.primary,
            paddingVertical: theme.spacing.xs,
          },
        ]}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1 },
});
