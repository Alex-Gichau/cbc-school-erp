import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Award,
  CheckCircle2,
  CalendarDays,
  Printer,
  FileSpreadsheet,
  BookOpen,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  SlidersHorizontal,
  Menu,
  Check,
  X
} from 'lucide-react';
import { UserRole } from '../types';

export type TabType =
  | 'dashboard'
  | 'enrolment'
  | 'fees'
  | 'grading'
  | 'attendance'
  | 'timetable'
  | 'exams'
  | 'reports'
  | 'specification'
  | 'settings';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  userRole: UserRole;
  pendingExamsCount: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  pendingExamsCount,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [topDropdownOpen, setTopDropdownOpen] = useState(false);
  const [bottomDropdownOpen, setBottomDropdownOpen] = useState(false);

  const sections = [
    {
      title: 'MAIN MENU',
      items: [
        {
          id: 'dashboard' as TabType,
          label: 'Admin Dashboard',
          shortLabel: 'Dashboard',
          subLabel: 'Attendance & Trends',
          icon: LayoutDashboard,
          roles: ['admin', 'teacher'] as UserRole[]
        },
        {
          id: 'attendance' as TabType,
          label: 'Attendance Register',
          shortLabel: 'Attendance',
          subLabel: 'Daily Roll Call Pulse',
          icon: CheckCircle2,
          roles: ['admin', 'teacher'] as UserRole[]
        }
      ]
    },
    {
      title: 'ACADEMICS & ROSTER',
      items: [
        {
          id: 'enrolment' as TabType,
          label: 'Learner Enrolment',
          shortLabel: 'Learners',
          subLabel: 'Student Cards & Admissions',
          icon: Users,
          roles: ['admin', 'teacher'] as UserRole[]
        },
        {
          id: 'grading' as TabType,
          label: 'Academic Grading',
          shortLabel: 'Grading',
          subLabel: 'Marks & Letter Grades',
          icon: Award,
          roles: ['admin', 'teacher'] as UserRole[]
        },
        {
          id: 'timetable' as TabType,
          label: 'Timetable Scheduling',
          shortLabel: 'Timetable',
          subLabel: 'Weekly Master Periods',
          icon: CalendarDays,
          roles: ['admin', 'teacher'] as UserRole[]
        },
        {
          id: 'reports' as TabType,
          label: 'Terminal Reports',
          shortLabel: 'Reports',
          subLabel: 'Official Report Cards',
          icon: FileSpreadsheet,
          roles: ['admin', 'teacher'] as UserRole[]
        }
      ]
    },
    {
      title: 'FINANCE & OPERATIONS',
      items: [
        {
          id: 'fees' as TabType,
          label: 'Learner Fees & Arrears',
          shortLabel: 'Fees',
          subLabel: 'Receipts & Collection Ledgers',
          icon: CreditCard,
          roles: ['admin'] as UserRole[]
        },
        {
          id: 'exams' as TabType,
          label: 'Exam Print Portal',
          shortLabel: 'Exam Press',
          subLabel: userRole === 'admin' ? 'Print Room Pipeline' : 'Submit Paper for Printing',
          icon: Printer,
          badge: pendingExamsCount > 0 ? pendingExamsCount : undefined,
          roles: ['admin', 'teacher'] as UserRole[]
        }
      ]
    },
    {
      title: 'ADMINISTRATION & SETTINGS',
      items: [
        {
          id: 'settings' as TabType,
          label: 'System Settings',
          shortLabel: 'Permissions',
          subLabel: 'Permissions & Access Matrix',
          icon: SlidersHorizontal,
          roles: ['admin', 'teacher'] as UserRole[]
        },
        {
          id: 'specification' as TabType,
          label: 'System Specification',
          shortLabel: 'Spec Guide',
          subLabel: 'Non-Technical User Manual',
          icon: BookOpen,
          roles: ['admin', 'teacher'] as UserRole[]
        }
      ]
    }
  ];

  // All items accessible to the active user role
  const allAccessibleItems = sections
    .flatMap((sec) => sec.items)
    .filter((item) => item.roles.includes(userRole));

  const handleTabClick = (tabId: TabType) => {
    onSelectTab(tabId);
    setTopDropdownOpen(false);
    setBottomDropdownOpen(false);
  };

  // Reusable dropdown menu content with categorized items and rounded corners
  const renderDropdownContent = () => (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100">
        <div>
          <div className="text-xs font-bold text-slate-900">All Modules & Tools</div>
          <div className="text-[10px] text-slate-400">PCEA St Andrews Kindergarten</div>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            userRole === 'admin'
              ? 'bg-orange-100 text-orange-700 border border-orange-200'
              : 'bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          {userRole === 'admin' ? 'Administrator' : 'Class Teacher'}
        </span>
      </div>

      <div className="space-y-3">
        {sections.map((sec, secIdx) => {
          const visibleSecItems = sec.items.filter((item) =>
            item.roles.includes(userRole)
          );
          if (visibleSecItems.length === 0) return null;

          return (
            <div key={secIdx} className="space-y-1">
              <div className="px-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                {sec.title}
              </div>
              <div className="space-y-1">
                {visibleSecItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={`dropdown-item-${item.id}`}
                      id={`dropdown-module-${item.id}`}
                      type="button"
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-orange-500 text-white font-semibold shadow-xs'
                          : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-transparent hover:border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <div
                            className={`text-xs font-bold leading-tight truncate ${
                              isActive ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            {item.label}
                          </div>
                          <div
                            className={`text-[10px] truncate ${
                              isActive ? 'text-orange-100' : 'text-slate-400'
                            }`}
                          >
                            {item.subLabel}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {item.badge !== undefined && (
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                              isActive
                                ? 'bg-white text-orange-600'
                                : 'bg-rose-600 text-white'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {isActive ? (
                          <Check className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* ========================================================= */}
      {/* 1. MOBILE VIEW: MIDDLE NAVBAR CENTERED TO SCREEN          */}
      {/* With rounded corners (rounded-2xl) and Dropdown Menu       */}
      {/* ========================================================= */}
      <div className="md:hidden w-full flex flex-col items-center px-3 pt-2.5 pb-1 shrink-0 bg-slate-50/95 sticky top-16 z-30">
        <nav
          id="mobile-middle-navbar"
          aria-label="Mobile School Navigation"
          className="relative w-full max-w-md mx-auto bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm rounded-2xl p-1.5 flex items-center justify-between gap-1"
        >
          {/* Horizontally scrollable pill tabs with rounded corners */}
          <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 px-0.5">
            {allAccessibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`mobile-mid-nav-${item.id}`}
                  type="button"
                  onClick={() => handleTabClick(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.shortLabel}</span>

                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                        isActive ? 'bg-white text-orange-600' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* More Button that opens the Dropdown on Mobile */}
          <div className="relative shrink-0">
            <button
              id="mobile-middle-navbar-more-btn"
              type="button"
              onClick={() => {
                setTopDropdownOpen(!topDropdownOpen);
                setBottomDropdownOpen(false);
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                topDropdownOpen
                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/25'
                  : 'bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-600 border-slate-200/80'
              }`}
              title="Open all school modules menu"
              aria-label="Open all school modules dropdown menu"
              aria-expanded={topDropdownOpen}
              aria-haspopup="true"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>More</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${
                  topDropdownOpen ? 'rotate-180 text-white' : 'text-slate-400'
                }`}
              />
            </button>

            {/* Mobile Navbar Dropdown Menu */}
            {topDropdownOpen && (
              <>
                {/* Click-away backdrop */}
                <div
                  className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px]"
                  onClick={() => setTopDropdownOpen(false)}
                  aria-hidden="true"
                />

                {/* Dropdown Card with rounded-2xl corners */}
                <div
                  id="mobile-navbar-more-dropdown"
                  className="absolute right-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 z-50 max-h-[75vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  {renderDropdownContent()}
                </div>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* ========================================================= */}
      {/* 2. MOBILE VIEW: FLOATING BOTTOM-MIDDLE QUICK DOCK NAVBAR  */}
      {/* Centered with rounded corners (rounded-2xl) & Dropdown     */}
      {/* ========================================================= */}
      <div className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-auto max-w-[94vw] pointer-events-none">
        <div className="relative bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-slate-900/10 rounded-2xl p-1.5 flex items-center justify-center gap-1 pointer-events-auto">
          {allAccessibleItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={`dock-${item.id}`}
                type="button"
                onClick={() => handleTabClick(item.id)}
                className={`p-2 rounded-xl text-xs flex flex-col items-center justify-center transition-all cursor-pointer min-w-[50px] ${
                  isActive
                    ? 'bg-orange-500 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={item.label}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[9px] mt-0.5 leading-none">{item.shortLabel}</span>
              </button>
            );
          })}

          {/* Fifth item: Exam printing if pending, or settings */}
          {userRole === 'admin' ? (
            <button
              type="button"
              onClick={() => handleTabClick('exams')}
              className={`p-2 rounded-xl text-xs flex flex-col items-center justify-center transition-all cursor-pointer min-w-[50px] relative ${
                currentTab === 'exams'
                  ? 'bg-orange-500 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Exam Print Pipeline"
            >
              <Printer className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 leading-none">Exams</span>
              {pendingExamsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-600 ring-1 ring-white" />
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleTabClick('grading')}
              className={`p-2 rounded-xl text-xs flex flex-col items-center justify-center transition-all cursor-pointer min-w-[50px] ${
                currentTab === 'grading'
                  ? 'bg-orange-500 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Academic Grading"
            >
              <Award className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 leading-none">Grades</span>
            </button>
          )}

          {/* Bottom Dock More button with Upward Dropdown */}
          <div className="relative">
            <button
              id="mobile-dock-more-btn"
              type="button"
              onClick={() => {
                setBottomDropdownOpen(!bottomDropdownOpen);
                setTopDropdownOpen(false);
              }}
              className={`p-2 rounded-xl text-xs flex flex-col items-center justify-center transition-all cursor-pointer min-w-[50px] ${
                bottomDropdownOpen
                  ? 'bg-orange-500 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="All Modules Dropdown"
              aria-expanded={bottomDropdownOpen}
              aria-haspopup="true"
            >
              <Menu className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 leading-none">More</span>
            </button>

            {/* Bottom Dock Dropdown (drops upward above dock) */}
            {bottomDropdownOpen && (
              <>
                {/* Click-away backdrop */}
                <div
                  className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px]"
                  onClick={() => setBottomDropdownOpen(false)}
                  aria-hidden="true"
                />

                {/* Upward Dropdown Container with rounded-2xl */}
                <div
                  id="mobile-dock-more-dropdown"
                  className="absolute right-0 bottom-full mb-2.5 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-2 z-50 max-h-[70vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-150"
                >
                  {renderDropdownContent()}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. DESKTOP VIEW: STANDARD LEFT SIDEBAR                    */}
      {/* Hidden on mobile (hidden md:flex), active on md+ screens   */}
      {/* ========================================================= */}
      <aside
        id="app-sidebar"
        className={`bg-white text-slate-700 hidden md:flex md:flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-200/90 shadow-xs select-none transition-all duration-300 ease-in-out ${
          isCollapsed
            ? 'md:w-16 lg:w-[74px]'
            : 'md:w-60 lg:w-64'
        }`}
      >
        {/* Top Header & Role Indicator */}
        <div
          className={`border-b border-slate-100 ${
            isCollapsed ? 'p-2.5 flex flex-col items-center gap-2' : 'p-3.5'
          }`}
        >
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 px-3 py-2 rounded-xl bg-orange-50/70 border border-orange-200/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-extrabold tracking-wider text-orange-600">
                    Active Workspace
                  </div>
                  <div className="text-xs font-bold text-slate-900 capitalize">
                    {userRole === 'admin' ? 'Principal & Bursar' : 'Teaching Staff'}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    userRole === 'admin'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'bg-slate-800 text-white'
                  }`}
                >
                  {userRole === 'admin' ? 'Admin' : 'Teacher'}
                </span>
              </div>

              {onToggleCollapse && (
                <button
                  id="sidebar-collapse-toggle-btn"
                  type="button"
                  onClick={onToggleCollapse}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                  title="Collapse sidebar (hide text labels)"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 w-full">
              {onToggleCollapse && (
                <button
                  id="sidebar-expand-toggle-btn"
                  type="button"
                  onClick={onToggleCollapse}
                  className="w-10 h-10 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center justify-center cursor-pointer border border-transparent hover:border-orange-200"
                  title="Expand sidebar"
                  aria-label="Expand sidebar"
                >
                  <PanelLeftOpen className="w-5 h-5 text-orange-600" />
                </button>
              )}
              <div
                className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider text-center ${
                  userRole === 'admin' ? 'bg-orange-500 text-white' : 'bg-slate-800 text-white'
                }`}
                title={`Active role: ${
                  userRole === 'admin' ? 'School Administrator' : 'Class Teacher'
                }`}
              >
                {userRole === 'admin' ? 'ADM' : 'TCH'}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <div className={`flex-1 overflow-y-auto py-3 space-y-4 ${isCollapsed ? 'px-2' : 'px-2'}`}>
          {sections.map((sec, secIdx) => {
            const visibleSecItems = sec.items.filter((item) =>
              item.roles.includes(userRole)
            );
            if (visibleSecItems.length === 0) return null;

            return (
              <div key={secIdx} className="space-y-1">
                {!isCollapsed ? (
                  <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    {sec.title}
                  </div>
                ) : (
                  secIdx > 0 && <div className="border-t border-slate-200/60 my-2 mx-1" />
                )}

                <div className="space-y-1">
                  {visibleSecItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;

                    if (isCollapsed) {
                      return (
                        <div key={item.id} className="relative group">
                          <button
                            id={`sidebar-tab-collapsed-${item.id}`}
                            type="button"
                            onClick={() => handleTabClick(item.id)}
                            className={`w-11 h-11 mx-auto rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                              isActive
                                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-400/40'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                            aria-label={item.label}
                          >
                            <Icon
                              className={`w-5 h-5 ${
                                isActive
                                  ? 'text-white'
                                  : 'text-slate-500 group-hover:text-slate-800'
                              }`}
                            />

                            {item.badge !== undefined && (
                              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                                {item.badge}
                              </span>
                            )}
                          </button>

                          {/* Hover Tooltip in Collapsed Mode */}
                          <div className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex flex-col bg-slate-900 text-white px-3 py-2 rounded-xl shadow-2xl text-xs whitespace-nowrap animate-in fade-in duration-150 border border-slate-700">
                            <span className="font-bold text-white text-xs">{item.label}</span>
                            <span className="text-[10px] text-slate-400">{item.subLabel}</span>
                            {item.badge !== undefined && (
                              <span className="text-[10px] font-bold text-orange-400 mt-0.5">
                                {item.badge} pending action
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={item.id}
                        id={`sidebar-tab-${item.id}`}
                        type="button"
                        onClick={() => handleTabClick(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all group cursor-pointer ${
                          isActive
                            ? 'border-l-[3px] border-orange-500 bg-orange-50/70 text-orange-600 font-semibold shadow-xs'
                            : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive
                                ? 'text-orange-500'
                                : 'text-slate-400 group-hover:text-slate-600'
                            }`}
                          />
                          <div className="truncate">
                            <div
                              className={`text-xs leading-tight truncate ${
                                isActive ? 'text-orange-600 font-bold' : ''
                              }`}
                            >
                              {item.label}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {item.subLabel}
                            </div>
                          </div>
                        </div>

                        {item.badge !== undefined && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold shrink-0 ${
                              isActive
                                ? 'bg-orange-500 text-white'
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* School Footer Note */}
        <div className="p-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          {!isCollapsed ? (
            <>
              <span className="font-medium truncate pr-1">PCEA St Andrews Kindergarten</span>
              <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200/50 shrink-0">
                2026 AY
              </span>
            </>
          ) : (
            <div
              className="mx-auto flex flex-col items-center text-[10px] font-bold text-slate-400"
              title="PCEA St Andrews Kindergarten 2026"
            >
              <span>2026</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
