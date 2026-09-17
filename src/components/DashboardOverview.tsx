import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { AttendanceAnalytics, Student, UserRole } from '../types';
import { TabType } from './Sidebar';

interface DashboardOverviewProps {
  analytics: AttendanceAnalytics;
  students: Student[];
  feeSummary: { totalBilled: number; totalCollected: number; totalOutstanding: number; collectionRate: number };
  pendingExamsCount: number;
  userRole: UserRole;
  onNavigateTab: (tab: TabType) => void;
  onOpenNewStudentModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  analytics,
  students,
  feeSummary,
  pendingExamsCount,
  userRole,
  onNavigateTab,
  onOpenNewStudentModal
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '1W' | '1M'>('1W');

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
            {/* Sparkline Visual (Orange Waves) */}
            <div className="w-20 h-8 flex items-end gap-1">
              {[40, 65, 55, 80, 70, 95, 88].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-orange-400/80 group-hover:bg-orange-500 rounded-t transition-all"
                ></div>
              ))}
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

      {/* Mid Section: Attendance & Roll Call Trend Analysis (Orange Wave matching "Login Count Analysis") */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Chart Column */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <h2 className="text-sm font-bold text-slate-900">
                  School-Wide Daily Attendance Trends
                </h2>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Continuous presence trends monitored across morning roll call registers.
              </p>
            </div>

            {/* Timeframe selector matching screenshot */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold">
              {(['1D', '1W', '1M'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    selectedTimeframe === tf
                      ? 'bg-orange-500 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Warm Coral-Orange Smooth Wave Visual Graphic (Matching Screenshot's Login Count Analysis) */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-700">Attendance Index (0 - 100%)</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                  <span className="text-[11px] text-slate-600">Daily Presence Rate</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
                  <span className="text-[11px] text-slate-600">School Target (95%)</span>
                </div>
              </div>
            </div>

            {/* Visual SVG Curve in Warm Orange Palette */}
            <div className="relative h-48 sm:h-52 md:h-56 lg:h-52 xl:h-60 w-full bg-orange-50/20 rounded-xl p-2 border border-orange-100/50 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                {/* Horizontal Guideline 95% Target */}
                <line x1="0" y1="25" x2="500" y2="25" stroke="#0f172a" strokeDasharray="4 4" strokeWidth="1.2" opacity="0.3" />
                
                {/* Gradient Definition */}
                <defs>
                  <linearGradient id="orangePulseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Area Fill */}
                <path
                  d="M0,70 Q60,30 120,45 T240,35 T360,55 T440,25 T500,40 L500,150 L0,150 Z"
                  fill="url(#orangePulseGradient)"
                />

                {/* Main Stroke Line */}
                <path
                  d="M0,70 Q60,30 120,45 T240,35 T360,55 T440,25 T500,40"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2.8"
                />

                {/* Pulse Dots */}
                <circle cx="120" cy="45" r="4" fill="#ffffff" stroke="#ea580c" strokeWidth="2.5" />
                <circle cx="240" cy="35" r="4" fill="#ffffff" stroke="#ea580c" strokeWidth="2.5" />
                <circle cx="360" cy="55" r="4" fill="#ffffff" stroke="#ea580c" strokeWidth="2.5" />
                <circle cx="440" cy="25" r="5" fill="#f97316" stroke="#ffffff" strokeWidth="2" />
              </svg>

              {/* Active Marker Tooltip overlay */}
              <div className="absolute top-4 right-14 bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg border border-orange-200 shadow-sm text-center pointer-events-none">
                <span className="text-[10px] text-slate-400 block font-medium">Thursday Roll Call</span>
                <span className="text-xs font-black text-orange-600">95.8% Present</span>
              </div>
            </div>

            {/* Weekday Axis Labels */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-2 mt-2">
              <span>Mon (96.2%)</span>
              <span>Tue (95.0%)</span>
              <span>Wed (94.1%)</span>
              <span>Thu (95.8%)</span>
              <span>Fri (92.4%)</span>
              <span className="text-orange-600 font-bold">Today (94.8%)</span>
            </div>
          </div>

          {/* Grade Attendance Progress Bars (Matching Screenshot's Peak Hours modules) */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800">
                Grade-by-Grade Attendance Standing
              </span>
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
                  className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{item.grade}</span>
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
                      style={{ width: `${item.rate}%` }}
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
    </div>
  );
};
