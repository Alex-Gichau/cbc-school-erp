import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { ThemeMode } from '../types';

interface ThemeSwitcherProps {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  onThemeChange: (theme: ThemeMode) => void;
  onToggleTheme?: () => void;
  variant?: 'compact' | 'segmented' | 'menu';
  className?: string;
  showLabel?: boolean;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  theme,
  resolvedTheme,
  onThemeChange,
  onToggleTheme,
  variant = 'compact',
  className = '',
  showLabel = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const options: { mode: ThemeMode; label: string; desc: string; icon: typeof Sun }[] = [
    {
      mode: 'light',
      label: 'Light Mode',
      desc: 'Daytime classroom view',
      icon: Sun
    },
    {
      mode: 'dark',
      label: 'Dark Mode',
      desc: 'Low-light after hours & evening grading',
      icon: Moon
    },
    {
      mode: 'system',
      label: 'System Match',
      desc: 'Syncs with device OS theme',
      icon: Monitor
    }
  ];

  // =========================================================
  // 1. SEGMENTED CONTROL (Ideal for Settings / Forms)
  // =========================================================
  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80 ${className}`}
        role="radiogroup"
        aria-label="Theme mode selection"
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = theme === opt.mode;
          return (
            <button
              key={opt.mode}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onThemeChange(opt.mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-750'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isSelected
                    ? opt.mode === 'dark'
                      ? 'text-indigo-500 dark:text-indigo-400'
                      : opt.mode === 'light'
                      ? 'text-amber-500'
                      : 'text-orange-500'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // =========================================================
  // 2. DROPDOWN MENU VARIANT
  // =========================================================
  if (variant === 'menu') {
    const ActiveIcon = resolvedTheme === 'dark' ? Moon : Sun;

    return (
      <div className={`relative inline-block ${className}`} ref={containerRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200/80 dark:border-slate-700 cursor-pointer"
          title={`Active theme: ${theme} (${resolvedTheme})`}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <ActiveIcon
            className={`w-4 h-4 ${
              resolvedTheme === 'dark' ? 'text-indigo-400' : 'text-amber-500'
            }`}
          />
          {showLabel && (
            <span className="capitalize hidden sm:inline">
              {theme === 'system' ? 'System' : resolvedTheme === 'dark' ? 'Dark' : 'Light'}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/80 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
              <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Display Theme & Night Mode
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Low-light contrast designed for after-hours work
              </p>
            </div>
            <div className="space-y-0.5 px-1">
              {options.map((opt) => {
                const Icon = opt.icon;
                const isSelected = theme === opt.mode;
                return (
                  <button
                    key={opt.mode}
                    type="button"
                    onClick={() => {
                      onThemeChange(opt.mode);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50/80 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight">{opt.label}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                          {opt.desc}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================
  // 3. COMPACT ONE-CLICK TOGGLE (Default for Navbar/Sidebar)
  // =========================================================
  const isDarkActive = resolvedTheme === 'dark';

  const handleClick = () => {
    if (onToggleTheme) {
      onToggleTheme();
    } else {
      onThemeChange(isDarkActive ? 'light' : 'dark');
    }
  };

  return (
    <button
      id="theme-toggle-btn"
      type="button"
      onClick={handleClick}
      className={`group relative flex items-center gap-2 p-2 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all cursor-pointer ${
        isDarkActive
          ? 'bg-slate-800 hover:bg-slate-750 text-indigo-300 border-slate-700 hover:border-slate-600 shadow-2xs'
          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200/80 hover:border-slate-300 shadow-2xs'
      } ${className}`}
      title={
        isDarkActive
          ? 'Switch to Light Mode (Daytime View) • Shortcut: Shift+D'
          : 'Switch to Dark Mode (Low-Light Evening Mode for Teachers) • Shortcut: Shift+D'
      }
      aria-label={
        isDarkActive
          ? 'Switch to Light Mode'
          : 'Switch to Dark Mode for low-light after-hours working'
      }
      aria-pressed={isDarkActive}
    >
      <div className="relative w-4 h-4 shrink-0 flex items-center justify-center">
        {isDarkActive ? (
          <Moon className="w-4 h-4 text-indigo-400 transition-transform duration-300 group-hover:-rotate-12" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 transition-transform duration-300 group-hover:rotate-45" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-semibold hidden md:inline truncate">
          {isDarkActive ? 'Night Shift' : 'Daylight'}
        </span>
      )}
    </button>
  );
};
