/**
 * ThemeToggle - Dark/Light mode toggle button
 * Shows sun icon in dark mode, moon icon in light mode
 * Styled to match the History Academy design system
 */

import { Sun, Moon } from 'lucide-react';
import { useThemeSafe } from '@/context/ThemeContext';

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useThemeSafe();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center w-8 h-8 rounded-full bg-ink-lift border border-gold-2/20 hover:border-gold-2/40 hover:bg-charcoal transition-colors duration-150"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun size={14} className="text-gold-2" />
      ) : (
        <Moon size={14} className="text-gold-2" />
      )}
    </button>
  );
}
