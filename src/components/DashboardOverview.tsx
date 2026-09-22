import React, { useMemo } from 'react';
import {
  Users,
  CheckCircle,
  CreditCard,
  Printer,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Phone,
  UserPlus,
  CalendarCheck,
  FileSpreadsheet,
  BookOpen,
  Activity,
  HardDrive,
  Clock,
  ShieldCheck,
  RefreshCw,
  FileText,
  CheckCircle2,
  ChevronRight,
  Target
} from 'lucide-react';
import { AttendanceAnalytics, Student, UserRole, FeePayment } from '../types';
import { TabType } from './Sidebar';
import { QuickActionsFloatingMenu } from './QuickActionsFloatingMenu';
import { AttendanceTrendsChart } from './AttendanceTrendsChart';

interface DashboardOverviewProps {
  analytics: AttendanceAnalytics;
  students: Student[];
  payments?: FeePayment[];
  feeSummary: { totalBilled: number; totalCollected: number; totalOutstanding: number; collectionRate: number };
  pendingExamsCount: number;
  userRole: UserRole;
  currentUserName?: string;
  onNavigateTab: (tab: TabType) => void;
  onOpenNewStudentModal: () => void;
  onAddStudent?: (student: Partial<Student>) => Promise<void>;
  onRecordPayment?: (data: {
    studentId: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
    recordedBy: string;
  }) => Promise<void>;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  analytics,
  students,
  payments = [],
  feeSummary,
  pendingExamsCount,
  userRole,
  currentUserName = 'Arthur Pendelton',
  onNavigateTab,
  onOpenNewStudentModal,
  onAddStudent,
  onRecordPayment
}) => {
  const schoolTotal = analytics.totalStudents || 340;

  return (
    <div className="space-y-5">
      {/* Top Header & Breadcrumb Bar matching Screenshot */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            School Operations & Attendance Dashboard
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            <span className="hover:text-slate-800 cursor-pointer" onClick={() => onNavigateTab('dashboard')}>
              Dashboard
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-orange-600 font-semibold">Attendance Pulse & Operations</span>
          </div>
        </div>

        {/* Quick Action Top Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {userRole === 'admin' ? (
            <>
              <button
                onClick={onOpenNewStudentModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Admit Learner</span>
              </button>
              <button
                onClick={() => onNavigateTab('fees')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200/90 shadow-2xs transition-colors cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-orange-500" />
                <span>Record Fee</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigateTab('attendance')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Take Roll Call</span>
              </button>
              <button
                onClick={() => onNavigateTab('exams')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200/90 shadow-2xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-orange-500" />
                <span>Upload Exam Paper</span>
              </button>
            </>
          )}

          <button
            onClick={() => onNavigateTab('specification')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
            title="Open non-technical system manual"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">User Guide</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards (Directly matching the screenshot's top 4 KPI cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: School Attendance Rate */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-orange-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">School Attendance Rate</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-slate-900">{analytics.overallRate}%</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Last 30 school days</p>
            </div>
            {/* Sparkline Visual (Orange Waves mapped to last 7 daily trends) */}
            <div className="w-20 h-8 flex items-end gap-1">
              {analytics.dailyTrends.slice(-7).map((d, i) => {
                const normalizedHeight = Math.max(25, Math.min(100, Math.round(((d.rate - 88) / 12) * 75 + 25)));
                return (
                  <div
                    key={d.date || i}
                    title={`${d.dayLabel} (${d.rate}%): ${d.present} present`}
                    style={{ height: `${normalizedHeight}%` }}
                    className="flex-1 bg-orange-400/80 group-hover:bg-orange-500 rounded-t transition-all"
                  ></div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 2: Academic Status */}
        <div
          onClick={() => onNavigateTab('grading')}
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-orange-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Academic Grading</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-slate-900">Healthy</span>
              <p className="text-[11px] text-slate-400 mt-0.5">All streams active</p>
            </div>
            {/* Vertical Bars Graphic */}
            <div className="w-16 h-8 flex items-end gap-1">
              {[60, 45, 90, 75, 85].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-slate-800 rounded-t"
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Exam Print Queue */}
        <div
          onClick={() => onNavigateTab('exams')}
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-orange-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Exam Print Requisitions</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <Printer className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-slate-900">{pendingExamsCount}</span>
              <p className="text-[11px] text-orange-600 font-semibold mt-0.5">Queue active</p>
            </div>
            {/* Alert Level Status Bars (matching screenshot open IT tickets) */}
            <div className="w-16 h-8 flex items-end gap-1">
              {[35, 75, 50, 95, 60].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-orange-500 rounded-t"
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 4: Fee Collection Rate */}
        <div
          onClick={() => onNavigateTab('fees')}
          className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-orange-200 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Fee Collection Rate</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-slate-900">{feeSummary.collectionRate}%</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                KES {(feeSummary.totalCollected / 1000).toFixed(0)}k banked
              </p>
            </div>
            {/* Progress Segment Graphic */}
            <div className="w-16 h-8 flex items-end gap-1">
              {[50, 70, 85, 90, 76].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-orange-500 rounded-t"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mid Section: Attendance & Roll Call Trend Analysis (Shadcn Chart & Grade Progress) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Chart Column */}
        <div className="lg:col-span-2 space-y-5">
          <AttendanceTrendsChart
            analytics={analytics}
            schoolTotal={schoolTotal}
            onNavigateAttendance={() => onNavigateTab('attendance')}
          />

          {/* Grade Attendance Progress Bars (Direct link to roll call) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-bold text-slate-800">
                  Grade-by-Grade Attendance Standing
                </span>
                <p className="text-[10px] text-slate-400">Click any class to take or update today's roll call</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> 95-100%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span> 90-95%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> &lt; 90%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {analytics.gradeComparison.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigateTab('attendance')}
                  className="p-3 bg-slate-50/80 hover:bg-orange-50/40 rounded-xl border border-slate-200/60 hover:border-orange-200 transition-all flex flex-col justify-between cursor-pointer group"
                  title={`Click to open attendance register for ${item.grade}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                      {item.grade}
                    </span>
                    <span
                      className={`text-xs font-black ${
                        item.rate >= 95 ? 'text-emerald-700' : 'text-orange-600'
                      }`}
                    >
                      {item.rate}%
                    </span>
                  </div>
                  {/* Progress Line */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      style={{ width: `${Math.min(100, Math.max(0, item.rate))}%` }}
                      className={`h-full rounded-full ${
                        item.rate >= 95 ? 'bg-emerald-500' : 'bg-orange-500'
                      }`}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
                    <span>{item.totalStudents} enrolled</span>
                    <span>{item.absentCount} absent</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Quick School Actions (styled with Dark Circles like Screenshot's Quick IT Actions) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-5">
          {/* Quick IT Actions Panel */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Quick School Actions
              </h3>
            </div>

            {/* Circular Dark Buttons (Direct translation of Screenshot's Quick IT Actions) */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onNavigateTab('attendance')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-orange-50/50 border border-slate-200/70 text-center transition-all group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-orange-500 transition-colors shadow-xs">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 mt-2">Morning Roll Call</span>
                <span className="text-[10px] text-slate-400">Class registers</span>
              </button>

              <button
                onClick={() => onNavigateTab('fees')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-orange-50/50 border border-slate-200/70 text-center transition-all group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-orange-500 transition-colors shadow-xs">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 mt-2">Record Payment</span>
                <span className="text-[10px] text-slate-400">Generate receipt</span>
              </button>

              <button
                onClick={() => onNavigateTab('grading')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-orange-50/50 border border-slate-200/70 text-center transition-all group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-orange-500 transition-colors shadow-xs">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 mt-2">Input Marks</span>
                <span className="text-[10px] text-slate-400">Grade assessments</span>
              </button>

              <button
                onClick={() => onNavigateTab('exams')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-orange-50/50 border border-slate-200/70 text-center transition-all group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-orange-500 transition-colors shadow-xs">
                  <Printer className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 mt-2">Exam Print Room</span>
                <span className="text-[10px] text-slate-400">Manage queue</span>
              </button>
            </div>
          </div>

          {/* User Roles Distribution (Segmented Bar matching screenshot's "User Roles Distribution") */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Community Distribution
              </h3>
              <span className="text-[11px] text-slate-400 font-semibold">382 Total</span>
            </div>

            {/* Segmented Color Bar */}
            <div className="h-3 w-full rounded-full overflow-hidden flex gap-0.5">
              <div style={{ width: '75%' }} className="bg-orange-500" title="340 Learners"></div>
              <div style={{ width: '15%' }} className="bg-slate-900" title="28 Teachers"></div>
              <div style={{ width: '6%' }} className="bg-teal-700" title="8 Support Staff"></div>
              <div style={{ width: '4%' }} className="bg-amber-400" title="6 Admin"></div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mt-3 pt-2 border-t border-slate-100 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span>Learners (340)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
                <span>Teachers (28)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-700"></span>
                <span>Staff (8)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>Admin (6)</span>
              </div>
            </div>
          </div>

          {/* Chronic Absenteeism Alerts */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Chronic Absenteeism Watchlist
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Learners flagged for missing &gt; 15% of sessions this term.
            </p>

            <div className="space-y-2.5">
              {analytics.chronicAbsentees.map((std) => (
                <div
                  key={std.studentId}
                  className="p-2.5 rounded-lg bg-orange-50/40 border border-orange-200/50 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">{std.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {std.grade} • {std.daysMissed} days missed
                    </div>
                  </div>
                  <a
                    href={`tel:${std.guardianPhone}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 bg-white px-2 py-1 rounded border border-orange-200 shadow-2xs cursor-pointer"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Speed Dial for Common School Tasks */}
      <QuickActionsFloatingMenu
        students={students}
        payments={payments}
        currentUserName={currentUserName}
        userRole={userRole}
        onNavigateTab={onNavigateTab}
        onAddStudent={onAddStudent || (async () => { onOpenNewStudentModal(); })}
        onRecordPayment={onRecordPayment || (async () => { onNavigateTab('fees'); })}
      />
    </div>
  );
};
