import FontAwesome from '@expo/vector-icons/FontAwesome';

import { useTheme } from '@/src/theme';

type FontAwesomeName = React.ComponentProps<typeof FontAwesome>['name'];

export type IconName =
  | 'plus'
  | 'search'
  | 'refresh'
  | 'inbox'
  | 'cloud'
  | 'cloud-upload'
  | 'exclamation-circle'
  | 'check-circle'
  | 'trash'
  | 'list';

const ICON_MAP: Record<IconName, FontAwesomeName> = {
  plus: 'plus',
  search: 'search',
  refresh: 'refresh',
  inbox: 'inbox',
  cloud: 'cloud',
  'cloud-upload': 'cloud-upload',
  'exclamation-circle': 'exclamation-circle',
  'check-circle': 'check-circle',
  trash: 'trash',
  list: 'list',
};

type Tone = 'primary' | 'secondary' | 'muted' | 'inverse' | 'brand' | 'danger' | 'success';

type Props = {
  name: IconName;
  size?: number;
  tone?: Tone;
  color?: string;
};

export function Icon({ name, size = 18, tone = 'primary', color }: Props) {
  const theme = useTheme();
  const resolvedColor =
    color ??
    (tone === 'brand'
      ? theme.colors.primary
      : tone === 'danger'
        ? theme.colors.danger
        : tone === 'success'
          ? theme.colors.success
          : theme.colors.text[tone === 'inverse' ? 'inverse' : tone]);

  return <FontAwesome name={ICON_MAP[name]} size={size} color={resolvedColor} />;
}
