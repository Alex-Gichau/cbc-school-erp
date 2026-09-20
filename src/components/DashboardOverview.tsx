import React, { useState, useMemo } from 'react';
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

interface TrendPoint {
  id: string;
  label: string;
  subLabel: string;
  rate: number;
  present: number;
  absent: number;
  total: number;
  date: string;
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
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '1W' | '1M'>('1W');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const schoolTotal = analytics.totalStudents || 340;

  // Build dynamic points based on timeframe
  const currentPoints: TrendPoint[] = useMemo(() => {
    if (selectedTimeframe === '1D') {
      const todayTotal = analytics.totalStudents || 340;
      const todayPresent = analytics.presentToday || 322;
      const todayAbsent = analytics.absentToday || 18;
      const todayRate = Math.round((todayPresent / todayTotal) * 1000) / 10;

      return [
        {
          id: 'session-1',
          label: '08:00 AM',
          subLabel: 'Morning Registration',
          rate: Math.min(100, Math.round((todayRate + 0.8) * 10) / 10),
          present: Math.min(todayTotal, todayPresent + 3),
          absent: Math.max(0, todayAbsent - 3),
          total: todayTotal,
          date: 'Morning Roll Call'
        },
        {
          id: 'session-2',
          label: '10:30 AM',
          subLabel: 'Mid-Morning Verification',
          rate: Math.min(100, Math.round((todayRate + 0.3) * 10) / 10),
          present: Math.min(todayTotal, todayPresent + 1),
          absent: Math.max(0, todayAbsent - 1),
          total: todayTotal,
          date: 'Recess Checkpoint'
        },
        {
          id: 'session-3',
          label: '01:15 PM',
          subLabel: 'Afternoon Roll Call',
          rate: todayRate,
          present: todayPresent,
          absent: todayAbsent,
          total: todayTotal,
          date: 'Post-Lunch Session'
        },
        {
          id: 'session-4',
          label: '03:30 PM',
          subLabel: 'Dismissal Standing',
          rate: todayRate,
          present: todayPresent,
          absent: todayAbsent,
          total: todayTotal,
          date: 'Final Register'
        }
      ];
    }

    if (selectedTimeframe === '1W') {
      const weekTrends = analytics.dailyTrends.length >= 6
        ? analytics.dailyTrends.slice(-6)
        : analytics.dailyTrends;

      return weekTrends.map((d, i) => ({
        id: d.date || `day-${i}`,
        label: i === weekTrends.length - 1 ? 'Today' : d.dayLabel,
        subLabel: d.date,
        rate: d.rate,
        present: d.present,
        absent: d.absent,
        total: d.present + d.absent || schoolTotal,
        date: d.date
      }));
    }

    // 1M (Entire 20-30 day term history)
    return analytics.dailyTrends.map((d, i) => ({
      id: d.date || `day-${i}`,
      label: d.dayLabel,
      subLabel: d.date,
      rate: d.rate,
      present: d.present,
      absent: d.absent,
      total: d.present + d.absent || schoolTotal,
      date: d.date
    }));
  }, [selectedTimeframe, analytics, schoolTotal]);

  // Summary Metrics
  const avgRate = useMemo(() => {
    if (currentPoints.length === 0) return 0;
    const sum = currentPoints.reduce((acc, p) => acc + p.rate, 0);
    return Math.round((sum / currentPoints.length) * 10) / 10;
  }, [currentPoints]);

  const peakPoint = useMemo(() => {
    if (currentPoints.length === 0) return null;
    return [...currentPoints].sort((a, b) => b.rate - a.rate)[0];
  }, [currentPoints]);

  const lowPoint = useMemo(() => {
    if (currentPoints.length === 0) return null;
    return [...currentPoints].sort((a, b) => a.rate - b.rate)[0];
  }, [currentPoints]);

  // Active point index
  const activeIdx = hoveredIndex !== null && hoveredIndex < currentPoints.length
    ? hoveredIndex
    : currentPoints.length - 1;
  const activePoint = currentPoints[activeIdx] || currentPoints[0];

  // SVG Geometry Calculation
  const padLeft = 35;
  const padRight = 25;
  const padTop = 20;
  const padBottom = 25;
  const svgWidth = 500;
  const svgHeight = 150;

  const minRateVal = useMemo(() => {
    if (currentPoints.length === 0) return 85;
    const minVal = Math.min(...currentPoints.map((p) => p.rate), 95);
    return Math.max(70, Math.floor(minVal - 3));
  }, [currentPoints]);
  const maxRateVal = 100;

  const getY = (rate: number) => {
    const clamped = Math.max(minRateVal, Math.min(maxRateVal, rate));
    const ratio = (clamped - minRateVal) / (maxRateVal - minRateVal);
    return padTop + (1 - ratio) * (svgHeight - padTop - padBottom);
  };

  const getX = (idx: number) => {
    if (currentPoints.length <= 1) return svgWidth / 2;
    return padLeft + (idx / (currentPoints.length - 1)) * (svgWidth - padLeft - padRight);
  };

  const coords = useMemo(() => {
    return currentPoints.map((p, idx) => ({
      x: getX(idx),
      y: getY(p.rate),
      point: p,
      index: idx
    }));
  }, [currentPoints, minRateVal]);

  const y95 = getY(95);

  const { linePath, areaPath } = useMemo(() => {
    if (coords.length === 0) return { linePath: '', areaPath: '' };
    if (coords.length === 1) {
      const y = coords[0].y;
      const lp = `M ${padLeft},${y} L ${svgWidth - padRight},${y}`;
      const ap = `${lp} L ${svgWidth - padRight},${svgHeight - padBottom} L ${padLeft},${svgHeight - padBottom} Z`;
      return { linePath: lp, areaPath: ap };
    }

    let lp = `M ${coords[0].x.toFixed(1)},${coords[0].y.toFixed(1)}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? 0 : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2 >= coords.length ? coords.length - 1 : i + 2];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      lp += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }

    const last = coords[coords.length - 1];
    const first = coords[0];
    const ap = `${lp} L ${last.x.toFixed(1)},${svgHeight - padBottom} L ${first.x.toFixed(1)},${svgHeight - padBottom} Z`;

    return { linePath: lp, areaPath: ap };
  }, [coords]);

  const activeCoord = coords[activeIdx] || coords[0];

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
                {selectedTimeframe === '1D'
                  ? "Real-time checkpoints and presence across today's roll-call sessions."
                  : selectedTimeframe === '1W'
                  ? 'Recent daily presence trends tracked against the 95.0% institutional target.'
                  : '30-day cumulative presence history monitored across morning roll call registers.'}
              </p>
            </div>

            {/* Timeframe selector */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold">
              {(['1D', '1W', '1M'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => {
                    setSelectedTimeframe(tf);
                    setHoveredIndex(null);
                  }}
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

          {/* Quick Metrics Bar for Selected Timeframe */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-1">
            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Period Average</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base font-black text-slate-900">{avgRate}%</span>
                <span className={`text-[10px] font-bold ${avgRate >= 95 ? 'text-emerald-600' : 'text-orange-600'}`}>
                  {avgRate >= 95 ? '≥ 95% target' : '< 95% target'}
                </span>
              </div>
            </div>
            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Today's Headcount</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base font-black text-slate-900">{analytics.presentToday}</span>
                <span className="text-[10px] text-slate-500 font-semibold">/ {schoolTotal}</span>
              </div>
            </div>
            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Peak Attendance</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base font-black text-emerald-700">{peakPoint ? `${peakPoint.rate}%` : 'N/A'}</span>
                <span className="text-[10px] text-slate-500 truncate max-w-[60px]">{peakPoint?.label}</span>
              </div>
            </div>
            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Variance</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className={`text-base font-black ${avgRate >= 95 ? 'text-emerald-700' : 'text-orange-600'}`}>
                  {avgRate >= 95 ? `+${(avgRate - 95).toFixed(1)}%` : `${(avgRate - 95).toFixed(1)}%`}
                </span>
                <span className="text-[10px] text-slate-400">vs 95.0%</span>
              </div>
            </div>
          </div>

          {/* Dynamic SVG Wave Graphic */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-700">Attendance Index ({minRateVal}% - 100%)</span>
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

            {/* Visual SVG Curve with Real Coordinate Mapping */}
            <div className="relative h-48 sm:h-52 md:h-56 lg:h-52 xl:h-60 w-full bg-orange-50/20 rounded-xl p-2 border border-orange-100/50 overflow-hidden">
              {/* Dynamic Marker Tooltip overlay */}
              {activePoint && (
                <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20 bg-white/95 border border-orange-200 shadow-sm rounded-xl p-2.5 max-w-[220px] pointer-events-none transition-all">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] font-bold text-slate-600 truncate uppercase tracking-wider">
                      {activePoint.date || activePoint.subLabel || activePoint.label}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        activePoint.rate >= 95
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-orange-50 text-orange-700 border border-orange-200/60'
                      }`}
                    >
                      {activePoint.rate >= 95 ? '≥ 95% Target' : '< 95% Target'}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-lg font-black text-orange-600">{activePoint.rate}%</span>
                    <span className="text-[11px] text-slate-500 font-medium">{activePoint.label}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 mt-1 border-t border-slate-100 font-semibold">
                    <span className="text-emerald-700">{activePoint.present} Present</span>
                    <span className="text-rose-600">{activePoint.absent} Absent</span>
                  </div>
                </div>
              )}

              <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="orangePulseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guideline 95% Target */}
                <line
                  x1={padLeft - 10}
                  y1={y95}
                  x2={500 - padRight + 10}
                  y2={y95}
                  stroke="#0f172a"
                  strokeDasharray="4 4"
                  strokeWidth="1.2"
                  opacity="0.3"
                />
                <text x={padLeft} y={Math.max(12, y95 - 4)} fontSize="8.5" fontWeight="700" fill="#64748b">
                  Target (95.0%)
                </text>

                {/* Area Fill */}
                {areaPath && <path d={areaPath} fill="url(#orangePulseGradient)" />}

                {/* Main Stroke Line */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Active Point Vertical Guideline */}
                {activeCoord && (
                  <line
                    x1={activeCoord.x}
                    y1={padTop}
                    x2={activeCoord.x}
                    y2={svgHeight - padBottom}
                    stroke="#f97316"
                    strokeDasharray="3 3"
                    strokeWidth="1.2"
                    opacity="0.6"
                  />
                )}

                {/* Dynamic Data Circles */}
                {coords.map((c, i) => {
                  const isActive = i === activeIdx;
                  return (
                    <g key={c.point.id || i}>
                      {/* Invisible hover & click target */}
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r={selectedTimeframe === '1M' ? 10 : 16}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(i)}
                        onClick={() => setHoveredIndex(i)}
                      />
                      {/* Halo if active */}
                      {isActive && (
                        <circle
                          cx={c.x}
                          cy={c.y}
                          r={selectedTimeframe === '1M' ? 6 : 8}
                          fill="#f97316"
                          opacity="0.25"
                        />
                      )}
                      {/* Visible point */}
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r={isActive ? (selectedTimeframe === '1M' ? 4 : 5) : (selectedTimeframe === '1M' ? 2.5 : 3.8)}
                        fill={isActive ? '#ffffff' : (c.point.rate >= 95 ? '#ffffff' : '#f97316')}
                        stroke={isActive ? '#ea580c' : (c.point.rate >= 95 ? '#059669' : '#ea580c')}
                        strokeWidth={isActive ? 2.5 : 2}
                        className="transition-all pointer-events-none"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Dynamic Axis Labels / Interaction Controls */}
            {selectedTimeframe === '1W' && (
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-2 mt-2.5 overflow-x-auto gap-1">
                {currentPoints.map((pt, idx) => (
                  <button
                    key={pt.id}
                    onClick={() => setHoveredIndex(idx)}
                    className={`px-2 py-1 rounded-lg text-center transition-all cursor-pointer ${
                      activeIdx === idx
                        ? 'bg-orange-500 text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-[10px] leading-tight">{pt.label}</span>
                    <span className="block text-[11px] font-bold leading-tight">{pt.rate}%</span>
                  </button>
                ))}
              </div>
            )}

            {selectedTimeframe === '1M' && (
              <div className="mt-2.5 px-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                  <span>Feb 16 (95.3%)</span>
                  <span>Feb 23 (96.8%)</span>
                  <span>Mar 02 (95.9%)</span>
                  <span>Mar 09 (96.2%)</span>
                  <span className="text-orange-600 font-bold">Today ({currentPoints[currentPoints.length - 1]?.rate || 95.3}%)</span>
                </div>
                <div className="flex items-center justify-between gap-1 mt-2 pt-1 border-t border-slate-100 overflow-x-auto">
                  {currentPoints.map((pt, idx) => (
                    <button
                      key={pt.id}
                      onClick={() => setHoveredIndex(idx)}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      title={`${pt.subLabel || pt.label}: ${pt.rate}% (${pt.present} present)`}
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        activeIdx === idx
                          ? 'bg-orange-500 ring-2 ring-orange-200 scale-125'
                          : pt.rate >= 95
                          ? 'bg-emerald-300 hover:bg-emerald-500'
                          : 'bg-orange-300 hover:bg-orange-500'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {selectedTimeframe === '1D' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2.5 px-1">
                {currentPoints.map((pt, idx) => (
                  <button
                    key={pt.id}
                    onClick={() => setHoveredIndex(idx)}
                    className={`p-2 rounded-lg text-left transition-all border cursor-pointer ${
                      activeIdx === idx
                        ? 'bg-orange-50 border-orange-300 ring-1 ring-orange-300'
                        : 'bg-slate-50 border-slate-200/80 hover:bg-white'
                    }`}
                  >
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">{pt.label}</span>
                    <div className="flex items-baseline justify-between mt-0.5">
                      <span className="text-xs font-bold text-slate-900">{pt.subLabel}</span>
                      <span className={`text-xs font-black ${pt.rate >= 95 ? 'text-emerald-700' : 'text-orange-600'}`}>
                        {pt.rate}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grade Attendance Progress Bars (Direct link to roll call) */}
          <div className="mt-6 pt-4 border-t border-slate-100">
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
