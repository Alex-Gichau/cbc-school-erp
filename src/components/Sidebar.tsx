import React from 'react';
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
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Layers,
  Sparkles,
  Shield,
  GraduationCap,
  SlidersHorizontal
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
  const sections = [
    {
      title: 'MAIN MENU',
      items: [
        {
          id: 'dashboard' as TabType,
          label: 'Admin Dashboard',
          subLabel: 'Attendance & Trends',
          icon: LayoutDashboard,
          roles: ['admin', 'teacher'] as UserRole[]
        },
        {
          id: 'attendance' as TabType,
          label: 'Attendance Register',
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
          subLabel: 'Student Cards & Admissions',
          icon: Users,
          roles: ['admin', 'teacher'] as UserRole[]
        },
        {
          id: 'grading' as TabType,
          label: 'Academic Grading',
          subLabel: 'Marks & Letter Grades',
          icon: Award,
          roles: ['admin', 'teacher'] as UserRole[]
        },
        {
          id: 'timetable' as TabType,
          label: 'Timetable Scheduling',
          subLabel: 'Weekly Master Periods',
          icon: CalendarDays,
          roles: ['admin', 'teacher'] as UserRole[]
        },
        {
          id: 'reports' as TabType,
          label: 'Terminal Reports',
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
          subLabel: 'Receipts & Collection Ledgers',
          icon: CreditCard,
          roles: ['admin'] as UserRole[]
        },
        {
          id: 'exams' as TabType,
          label: 'Exam Print Portal',
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
          subLabel: 'Permissions & Access Matrix',
          icon: SlidersHorizontal,
          roles: ['admin', 'teacher'] as UserRole[]
        },
        {
          id: 'specification' as TabType,
          label: 'System Specification',
          subLabel: 'Non-Technical User Manual',
          icon: BookOpen,
          roles: ['admin', 'teacher'] as UserRole[]
        }
      ]
    }
  ];

  const handleTabClick = (tabId: TabType) => {
    onSelectTab(tabId);
    // On small screens (< md), auto-close sidebar after selection
    if (window.innerWidth < 768 && !isCollapsed && onToggleCollapse) {
      onToggleCollapse();
    }
  };

  return (
    <>
      {/* Mobile Backdrop when drawer is open on small screens */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          onClick={onToggleCollapse}
          aria-hidden="true"
        />
      )}

      <aside
        id="app-sidebar"
        className={`bg-white text-slate-700 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-200/90 shadow-xs select-none transition-all duration-300 ease-in-out ${
          isCollapsed
            ? 'hidden md:flex md:w-16 lg:w-[74px]'
            : 'fixed inset-y-0 left-0 z-50 w-72 md:relative md:z-auto md:w-60 lg:w-64'
        }`}
      >
        {/* Top Header & Role Indicator */}
        <div className={`border-b border-slate-100 ${isCollapsed ? 'p-2.5 flex flex-col items-center gap-2' : 'p-3.5'}`}>
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
                    userRole === 'admin' ? 'bg-orange-500 text-white shadow-xs' : 'bg-slate-800 text-white'
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
                title={`Active role: ${userRole === 'admin' ? 'School Administrator' : 'Class Teacher'}`}
              >
                {userRole === 'admin' ? 'ADM' : 'TCH'}
              </div>
            </div>
          )}
        </div>

      {/* Navigation Sections */}
      <div className={`flex-1 overflow-y-auto py-3 space-y-4 ${isCollapsed ? 'px-2' : 'px-2'}`}>
        {sections.map((sec, secIdx) => {
          const visibleSecItems = sec.items.filter((item) => item.roles.includes(userRole));
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
                          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'}`} />

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
                            isActive ? 'text-orange-500' : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                        <div className="truncate">
                          <div className={`text-xs leading-tight truncate ${isActive ? 'text-orange-600 font-bold' : ''}`}>
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
          <div className="mx-auto flex flex-col items-center text-[10px] font-bold text-slate-400" title="PCEA St Andrews Kindergarten 2026">
            <span>2026</span>
          </div>
        )}
      </div>
    </aside>
    </>
  );
};
