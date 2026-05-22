import type { TextStyle, ViewStyle } from 'react-native';

import { palette, radius, spacing, typography, motion, hitSlop } from './tokens';

type ShadowStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

type StatusToken = { bg: string; fg: string };

export type Theme = {
  name: 'light' | 'dark';
  colors: {
    background: string;
    surface: string;
    surfaceMuted: string;
    surfaceRaised: string;
    border: string;
    overlay: string;
    primary: string;
    primarySoft: string;
    primaryContrast: string;
    success: string;
    successSoft: string;
    warning: string;
    warningSoft: string;
    danger: string;
    dangerSoft: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
      inverse: string;
      onPrimary: string;
      danger: string;
    };
    status: {
      todo: StatusToken;
      in_progress: StatusToken;
      done: StatusToken;
    };
    priority: {
      low: StatusToken;
      medium: StatusToken;
      high: StatusToken;
    };
    sync: {
      pending: StatusToken;
      failed: StatusToken;
      synced: StatusToken;
    };
  };
  shadow: {
    sm: ShadowStyle;
    md: ShadowStyle;
  };
  // Re-exported for convenience so consumers only need `useTheme()`.
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  motion: typeof motion;
  hitSlop: typeof hitSlop;
};

const sharedShadow = {
  sm: {
    shadowColor: palette.neutral900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: palette.neutral900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
} satisfies Theme['shadow'];

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: palette.neutral50,
    surface: palette.neutral0,
    surfaceMuted: palette.neutral100,
    surfaceRaised: palette.neutral0,
    border: palette.neutral200,
    overlay: 'rgba(17, 24, 39, 0.5)',
    primary: palette.primary500,
    primarySoft: palette.primary50,
    primaryContrast: palette.neutral0,
    success: palette.success500,
    successSoft: palette.success50,
    warning: palette.warning500,
    warningSoft: palette.warning50,
    danger: palette.danger500,
    dangerSoft: palette.danger50,
    text: {
      primary: palette.neutral900,
      secondary: palette.neutral600,
      muted: palette.neutral400,
      inverse: palette.neutral0,
      onPrimary: palette.neutral0,
      danger: palette.danger500,
    },
    status: {
      todo: { bg: palette.neutral100, fg: palette.neutral600 },
      in_progress: { bg: palette.warning50, fg: palette.warning600 },
      done: { bg: palette.success50, fg: palette.success600 },
    },
    priority: {
      low: { bg: palette.neutral100, fg: palette.neutral600 },
      medium: { bg: palette.primary50, fg: palette.primary600 },
      high: { bg: palette.danger50, fg: palette.danger600 },
    },
    sync: {
      pending: { bg: palette.warning50, fg: palette.warning600 },
      failed: { bg: palette.danger50, fg: palette.danger600 },
      synced: { bg: palette.success50, fg: palette.success600 },
    },
  },
  shadow: sharedShadow,
  spacing,
  radius,
  typography,
  motion,
  hitSlop,
};

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: palette.neutral950,
    surface: palette.neutral900,
    surfaceMuted: palette.neutral800,
    surfaceRaised: palette.neutral800,
    border: palette.neutral700,
    overlay: 'rgba(0, 0, 0, 0.6)',
    primary: '#818CF8',
    primarySoft: '#312E81',
    primaryContrast: palette.neutral0,
    success: '#34D399',
    successSoft: '#064E3B',
    warning: '#FBBF24',
    warningSoft: '#78350F',
    danger: '#F87171',
    dangerSoft: '#7F1D1D',
    text: {
      primary: palette.neutral50,
      secondary: palette.neutral300,
      muted: palette.neutral400,
      inverse: palette.neutral900,
      onPrimary: palette.neutral900,
      danger: '#FCA5A5',
    },
    status: {
      todo: { bg: palette.neutral800, fg: palette.neutral300 },
      in_progress: { bg: '#78350F', fg: '#FCD34D' },
      done: { bg: '#064E3B', fg: '#6EE7B7' },
    },
    priority: {
      low: { bg: palette.neutral800, fg: palette.neutral300 },
      medium: { bg: '#312E81', fg: '#A5B4FC' },
      high: { bg: '#7F1D1D', fg: '#FCA5A5' },
    },
    sync: {
      pending: { bg: '#78350F', fg: '#FCD34D' },
      failed: { bg: '#7F1D1D', fg: '#FCA5A5' },
      synced: { bg: '#064E3B', fg: '#6EE7B7' },
    },
  },
  shadow: {
    sm: { ...sharedShadow.sm, shadowOpacity: 0.4, shadowColor: palette.black },
    md: { ...sharedShadow.md, shadowOpacity: 0.5, shadowColor: palette.black },
  },
  spacing,
  radius,
  typography,
  motion,
  hitSlop,
};

export const themes = { light: lightTheme, dark: darkTheme } as const;

export type ThemeName = keyof typeof themes;
