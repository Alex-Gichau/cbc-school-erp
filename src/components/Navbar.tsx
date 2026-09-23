import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  FileText,
  Calendar,
  ChevronDown,
  Search,
  Printer,
  Users
} from 'lucide-react';
import { User, ThemeMode } from '../types';
import { TabType } from './Sidebar';
import { ThemeSwitcher } from './ThemeSwitcher';

interface NavbarProps {
  currentUser: User;
  users: User[];
  onSwitchUser: (user: User) => void;
  onOpenSpec: () => void;
  dbStatus: { provider: string; connected: boolean };
  pendingExamsCount?: number;
  activeStudentsCount?: number;
  onNavigateTab?: (tab: TabType) => void;
  theme?: ThemeMode;
  resolvedTheme?: 'light' | 'dark';
  onThemeChange?: (theme: ThemeMode) => void;
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  users,
  onSwitchUser,
  onOpenSpec,
  pendingExamsCount = 4,
  activeStudentsCount = 340,
  onNavigateTab,
  theme = 'system',
  resolvedTheme = 'light',
  onThemeChange = () => {},
  onToggleTheme = () => {}
}) => {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onNavigateTab) {
      onNavigateTab('enrolment');
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 shadow-2xs w-full transition-colors duration-200">
      <div className="w-full px-3 sm:px-5 lg:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4 max-w-full">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 ring-2 ring-orange-500/20 shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-sm sm:text-base lg:text-lg text-slate-900 dark:text-slate-100 tracking-tight font-sans truncate">
                PCEA St Andrews <span className="text-orange-500 dark:text-orange-400 font-black">Kindergarten</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/60 shrink-0">
                SMS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium hidden xl:block truncate">
              PCEA St Andrews Campus • Term 1, 2026 AY
            </p>
          </div>
        </div>

        {/* Center: Search in SMS Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm mx-2 sm:mx-3 min-w-0"
        >
          <div className="w-full relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search learners, grades, fees..."
              className="w-full pl-9 pr-14 py-1.5 sm:py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 pointer-events-none">
              <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-2xs">
                Enter ↵
              </kbd>
            </div>
          </div>
        </form>

        {/* Right Status Badges, Theme Toggle & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Active Term Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/40 text-orange-700 dark:text-orange-400 text-xs font-semibold shrink-0">
            <Calendar className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span>Term 1, 2026</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" title="Active Term Live" />
          </div>

          {/* Active Learners Pill */}
          {activeStudentsCount > 0 && (
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('enrolment')}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100/80 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer shrink-0"
              title="View enrolled learners directory"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-[11px] text-slate-600 dark:text-slate-400">Learners:</span>
              <span className="font-extrabold text-emerald-800 dark:text-emerald-300">{activeStudentsCount}</span>
            </button>
          )}

          {/* Print Queue Alert Pill */}
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('exams')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-50/90 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100/80 dark:hover:bg-rose-900/40 transition-colors cursor-pointer shrink-0"
            title="Open Exam Print Room & Requisitions"
          >
            <Printer className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="hidden md:inline text-[11px] text-slate-600 dark:text-slate-400">Print Queue:</span>
            <span className="font-extrabold text-rose-800 dark:text-rose-300">{pendingExamsCount}</span>
          </button>

          {/* Spec Guide Button */}
          <button
            id="navbar-spec-guide-btn"
            type="button"
            onClick={onOpenSpec}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200/80 dark:border-slate-700 cursor-pointer shrink-0"
            title="Open non-technical system specification guide"
          >
            <FileText className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="hidden sm:inline">Spec Guide</span>
          </button>

          {/* Theme Switcher Toggle (Light / Dark / Low-Light Night Mode) */}
          <ThemeSwitcher
            theme={theme}
            resolvedTheme={resolvedTheme}
            onThemeChange={onThemeChange}
            onToggleTheme={onToggleTheme}
            variant="compact"
            showLabel={false}
          />

          {/* Role Switcher Menu */}
          <div className="relative shrink-0">
            <button
              id="navbar-user-profile-btn"
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors text-left cursor-pointer shrink-0"
              aria-haspopup="true"
              aria-expanded={showDropdown}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-2xs shrink-0 ${
                  currentUser.role === 'admin' ? 'bg-orange-500' : 'bg-slate-800 dark:bg-slate-700'
                }`}
              >
                {currentUser.role === 'admin' ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : (
                  <UserCheck className="w-4 h-4" />
                )}
              </div>
              <div className="hidden md:block max-w-[130px] lg:max-w-[160px] truncate">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold capitalize truncate">
                  {currentUser.role === 'admin' ? 'Administrator' : 'Class Teacher'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            </button>

            {/* Click-away backdrop */}
            {showDropdown && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
                aria-hidden="true"
              />
            )}

            {/* User Switcher Dropdown */}
            {showDropdown && (
              <div
                id="navbar-user-dropdown"
                className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Switch Active User & Role
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        onSwitchUser(u);
                        setShowDropdown(false);
                      }}
                      className={`w-full px-3.5 py-2.5 text-left flex items-start gap-3 hover:bg-orange-50/50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                        u.id === currentUser.id ? 'bg-orange-50/70 dark:bg-slate-800/80 border-l-3 border-orange-500 font-medium' : ''
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5 ${
                          u.role === 'admin' ? 'bg-orange-500' : 'bg-slate-800 dark:bg-slate-700'
                        }`}
                      >
                        {u.role === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </div>
                      <div className="overflow-hidden min-w-0">
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{u.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{u.title}</div>
                        <span
                          className={`inline-block mt-0.5 text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                            u.role === 'admin'
                              ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
