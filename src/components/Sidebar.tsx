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
  Layers,
  Sparkles
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
  | 'specification';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  userRole: UserRole;
  pendingExamsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  pendingExamsCount
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
      title: 'DOCUMENTATION',
      items: [
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

  return (
    <aside className="w-full lg:w-64 bg-white text-slate-700 flex flex-col shrink-0 lg:min-h-[calc(100vh-4rem)] border-r border-slate-200/90 shadow-xs select-none">
      {/* Active Role Indicator Card */}
      <div className="p-4 border-b border-slate-100">
        <div className="px-3 py-2 rounded-xl bg-orange-50/60 border border-orange-200/60 flex items-center justify-between">
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
      </div>

      {/* Navigation Sections Styled Exactly like Screenshot */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
        {sections.map((sec, secIdx) => {
          const visibleSecItems = sec.items.filter((item) => item.roles.includes(userRole));
          if (visibleSecItems.length === 0) return null;

          return (
            <div key={secIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {sec.title}
              </div>
              <div className="space-y-0.5">
                {visibleSecItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
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
        <span className="font-medium">PCEA St Andrews Kindergarten</span>
        <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200/50">
          2026 AY
        </span>
      </div>
    </aside>
  );
};
