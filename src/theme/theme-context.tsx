import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { ConfigProvider, theme as antdTheme } from 'antd';

import { getInitialTheme, shouldFollowSystemTheme, ThemeMode } from './theme-preference';

const THEME_STORAGE_KEY = 'resume-site-theme';

interface ThemeContextValue {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  themeMode: ThemeMode;
  toggleTheme: () => void;
}

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const getSavedTheme = (): ThemeMode | null => {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : null;
};

const getSystemPrefersDark = (): boolean =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() =>
    getInitialTheme(getSavedTheme(), getSystemPrefersDark()),
  );

  useEffect(() => {
    const rootElement = document.documentElement;
    rootElement.dataset.theme = themeMode;
    rootElement.style.colorScheme = themeMode;
  }, [themeMode]);

  useEffect(() => {
    if (!shouldFollowSystemTheme(getSavedTheme())) {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      setThemeMode(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const setDarkMode = useCallback((darkMode: boolean) => {
    const nextTheme = darkMode ? 'dark' : 'light';
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    setThemeMode(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode((currentTheme) => {
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      return nextTheme;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      darkMode: themeMode === 'dark',
      setDarkMode,
      themeMode,
      toggleTheme,
    }),
    [setDarkMode, themeMode, toggleTheme],
  );

  const isDarkMode = themeMode === 'dark';

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider
        theme={{
          algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            borderRadius: 10,
            colorBgBase: isDarkMode ? '#0f172a' : '#f8fafc',
            colorBgContainer: isDarkMode ? '#1e293b' : '#ffffff',
            colorBorder: isDarkMode ? '#334155' : '#dbe3ee',
            colorPrimary: isDarkMode ? '#60a5fa' : '#2563eb',
            colorText: isDarkMode ? '#f8fafc' : '#172033',
            colorTextSecondary: isDarkMode ? '#cbd5e1' : '#526079',
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useThemeContext = (): ThemeContextValue => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeContext 必须在 ThemeProvider 内使用');
  }

  return context;
};
