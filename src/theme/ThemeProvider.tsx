import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { lightTheme, themes, type Theme, type ThemeName } from './themes';

type ThemeContextValue = {
  theme: Theme;
  name: ThemeName;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  name: 'light',
});

type Props = {
  children: ReactNode;
  // Force a specific theme — useful for tests and screenshots.
  forceName?: ThemeName;
};

export function ThemeProvider({ children, forceName }: Props) {
  const systemScheme = useColorScheme();
  const name: ThemeName = forceName ?? (systemScheme === 'dark' ? 'dark' : 'light');

  const value = useMemo(
    () => ({ theme: themes[name], name }),
    [name],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext).theme;
}

export function useThemeName(): ThemeName {
  return useContext(ThemeContext).name;
}
