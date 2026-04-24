/**
 * ThemeContext - Dark/Light mode theme management
 * Wraps next-themes to provide app-wide theme access with toggleTheme helper
 * Persists theme choice to localStorage automatically via next-themes
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

export type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeContextProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme: setNextTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setNextTheme(newTheme);
  };

  // Return children without context during SSR/hydration to prevent mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  const value: ThemeContextType = {
    theme: (theme as Theme) || 'dark',
    resolvedTheme: (resolvedTheme as 'dark' | 'light') || 'dark',
    setTheme: setNextTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeContextProvider');
  }
  return context;
}

// Export a safe version that doesn't throw - for use in components that might render before provider
export function useThemeSafe() {
  const context = useContext(ThemeContext);
  return context || {
    theme: 'dark' as Theme,
    resolvedTheme: 'dark' as const,
    setTheme: () => {},
    toggleTheme: () => {},
    isDark: true,
    isLight: false,
  };
}
