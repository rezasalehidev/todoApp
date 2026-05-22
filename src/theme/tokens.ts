/**
 * Raw design tokens. These are the lowest-level primitives — values only,
 * no semantic meaning. Build semantic themes (light/dark) on top of these.
 */

export const palette = {
  primary50: '#EEF2FF',
  primary100: '#E0E7FF',
  primary500: '#4F46E5',
  primary600: '#4338CA',
  primary700: '#3730A3',

  success50: '#D1FAE5',
  success500: '#059669',
  success600: '#047857',

  warning50: '#FEF3C7',
  warning500: '#D97706',
  warning600: '#B45309',

  danger50: '#FEE2E2',
  danger500: '#DC2626',
  danger600: '#B91C1C',

  neutral0: '#FFFFFF',
  neutral50: '#F9FAFB',
  neutral100: '#F3F4F6',
  neutral200: '#E5E7EB',
  neutral300: '#D1D5DB',
  neutral400: '#9CA3AF',
  neutral500: '#6B7280',
  neutral600: '#4B5563',
  neutral700: '#374151',
  neutral800: '#1F2937',
  neutral900: '#111827',
  neutral950: '#030712',
  black: '#000000',
} as const;

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '700' as const },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: '600' as const },
  subheading: { fontSize: 17, lineHeight: 22, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' as const },
  bodyStrong: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const },
} as const;

export const motion = {
  durations: {
    fast: 150,
    medium: 250,
    slow: 400,
  },
  delays: {
    listItem: 50,
  },
} as const;

export const hitSlop = {
  sm: { top: 4, bottom: 4, left: 4, right: 4 },
  md: { top: 8, bottom: 8, left: 8, right: 8 },
  lg: { top: 12, bottom: 12, left: 12, right: 12 },
} as const;

export type TypographyVariant = keyof typeof typography;
