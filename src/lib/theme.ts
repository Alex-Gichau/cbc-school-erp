import { useState, useEffect, useCallback } from 'react';
import { ThemeMode } from '../types';

export const THEME_STORAGE_KEY = 'pcea_sms_theme';

/**
 * Check if the user's OS or browser prefers dark mode.
 */
export const getSystemPrefersDark = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

/**
 * Retrieve saved theme mode from localStorage with fallback to system preference.
 */
export const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch (err) {
    console.warn('[Theme] Could not read theme from localStorage:', err);
  }
  return 'system';
};

/**
 * Determine actual active theme ('light' or 'dark') given the configured ThemeMode.
 */
export const resolveEffectiveTheme = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'system') {
    return getSystemPrefersDark() ? 'dark' : 'light';
  }
  return mode;
};

/**
 * Apply the theme class to document.documentElement and sync color-scheme.
 */
export const applyThemeToDocument = (mode: ThemeMode): 'light' | 'dark' => {
  if (typeof document === 'undefined') return 'light';
  const effective = resolveEffectiveTheme(mode);
  const root = document.documentElement;

  if (effective === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }

  return effective;
};

/**
 * Custom React hook to observe, toggle, and manage application theme.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => resolveEffectiveTheme(getInitialTheme()));

  // Apply theme and update document
  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (err) {
      console.warn('[Theme] Could not persist theme:', err);
    }
    const resolved = applyThemeToDocument(newTheme);
    setResolvedTheme(resolved);
  }, []);

  // Quick toggle between light and dark
  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const currentEffective = resolveEffectiveTheme(prev);
      return currentEffective === 'dark' ? 'light' : 'dark';
    });
  }, [setTheme]);

  // Initial application on mount & listen to system media query
  useEffect(() => {
    const initialResolved = applyThemeToDocument(theme);
    setResolvedTheme(initialResolved);

    // If in system mode, listen to OS dark mode changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      const saved = getInitialTheme();
      if (saved === 'system') {
        const resolved = applyThemeToDocument('system');
        setResolvedTheme(resolved);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else {
      mediaQuery.addListener(handleMediaChange);
    }

    // Sync across browser tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        const newMode = e.newValue as ThemeMode;
        if (newMode === 'light' || newMode === 'dark' || newMode === 'system') {
          setThemeState(newMode);
          setResolvedTheme(applyThemeToDocument(newMode));
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
      window.removeEventListener('storage', handleStorage);
    };
  }, [theme]);

  return {
    theme,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    setTheme,
    toggleTheme
  };
}
