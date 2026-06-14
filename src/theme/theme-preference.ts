export type ThemeMode = 'light' | 'dark';

export const getInitialTheme = (
  savedTheme: ThemeMode | null,
  prefersDarkMode: boolean,
): ThemeMode => {
  if (savedTheme) {
    return savedTheme;
  }

  return prefersDarkMode ? 'dark' : 'light';
};

export const shouldFollowSystemTheme = (savedTheme: ThemeMode | null): boolean => !savedTheme;
