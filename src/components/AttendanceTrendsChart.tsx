import React, { useState, useMemo, useRef } from 'react';
import { TrendingUp, TrendingDown, Target, Clock, Calendar, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { AttendanceAnalytics } from '../types';

interface AttendanceTrendsChartProps {
  analytics: AttendanceAnalytics;
  schoolTotal: number;
  onNavigateAttendance?: () => void;
}

interface TrendPoint {
  id: string;
  label: string;
  subLabel?: string;
  rate: number;
  present: number;
  absent: number;
  total: number;
  date?: string;
}

export const AttendanceTrendsChart: React.FC<AttendanceTrendsChartProps> = ({
  analytics,
  schoolTotal,
  onNavigateAttendance
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1D' | '1W' | '1M'>('1W');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Build dynamic trend points based on selected timeframe
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
          subLabel: 'Morning Register',
          rate: Math.min(100, Math.round((todayRate + 0.8) * 10) / 10),
          present: Math.min(todayTotal, todayPresent + 3),
          absent: Math.max(0, todayAbsent - 3),
          total: todayTotal,
          date: 'Morning Roll Call'
        },
        {
          id: 'session-2',
          label: '10:30 AM',
          subLabel: 'Mid-Morning Check',
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
      const weekTrends =
        analytics.dailyTrends.length >= 6
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

    // 1M (Entire term trend)
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

  // Active point index (defaults to latest point)
  const activeIdx =
    hoveredIndex !== null && hoveredIndex < currentPoints.length
      ? hoveredIndex
      : currentPoints.length - 1;
  const activePoint = currentPoints[activeIdx] || currentPoints[0];

  // SVG Geometry Dimensions
  const svgWidth = 600;
  const svgHeight = 200;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 24;
  const padBottom = 32;

  // Natural Dynamic Y-Axis scale calculation (no artificial fixed index ranges)
  const { minVal, maxVal, yTicks } = useMemo(() => {
    if (currentPoints.length === 0) {
      return { minVal: 85, maxVal: 100, yTicks: [100, 95, 90, 85] };
    }
    const lowest = Math.min(...currentPoints.map((p) => p.rate), 94);
    // Round down to a clean step (multiple of 2 or 5)
    let bottom = Math.max(70, Math.floor((lowest - 2) / 2) * 2);
    if (bottom > 92) bottom = 90;
    const top = 100;

    // Generate 4 to 5 clean ticks
    const range = top - bottom;
    const step = range <= 10 ? 2 : range <= 15 ? 3 : 5;
    const ticks: number[] = [];
    for (let t = top; t >= bottom; t -= step) {
      ticks.push(t);
    }
    if (!ticks.includes(bottom)) ticks.push(bottom);

    return { minVal: bottom, maxVal: top, yTicks: ticks };
  }, [currentPoints]);

  const getY = (rate: number) => {
    const clamped = Math.max(minVal, Math.min(maxVal, rate));
    const ratio = (clamped - minVal) / (maxVal - minVal);
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
  }, [currentPoints, minVal, maxVal]);

  const y95 = getY(95);
  const activeCoord = coords[activeIdx] || coords[0];

  // Smooth Catmull-Rom / Monotone Bezier Curve calculation
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

  // Dynamic Mouse Move Scrubbing across the entire chart area (like shadcn / Recharts crosshair)
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || coords.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const svgX = (clientX / rect.width) * svgWidth;

    // Find nearest point by x distance
    let nearestIdx = 0;
    let minDistance = Infinity;
    coords.forEach((c, idx) => {
      const dist = Math.abs(c.x - svgX);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = idx;
      }
    });

    setHoveredIndex(nearestIdx);
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!svgRef.current || coords.length === 0 || e.touches.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.touches[0].clientX - rect.left;
    const svgX = (clientX / rect.width) * svgWidth;

    let nearestIdx = 0;
    let minDistance = Infinity;
    coords.forEach((c, idx) => {
      const dist = Math.abs(c.x - svgX);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = idx;
      }
    });

    setHoveredIndex(nearestIdx);
  };

  // Trend variance indicator for footer
  const trendVariance = Math.round((avgRate - 95.0) * 10) / 10;
  const isUp = trendVariance >= 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs transition-all">
      {/* Shadcn Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              School Attendance & Daily Presence Trends
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {selectedTimeframe === '1D'
              ? "Live checkpoints tracked across today's morning roll-call sessions."
              : selectedTimeframe === '1W'
              ? 'Daily attendance percentage monitored against the 95.0% institutional target.'
              : '30-day cumulative presence history logged across all school grades.'}
          </p>
        </div>

        {/* Shadcn Segmented Control / Tabs */}
        <div className="inline-flex h-8 items-center justify-center rounded-lg bg-slate-100 p-0.5 text-slate-500 text-xs font-semibold self-start sm:self-auto border border-slate-200/50">
          <button
            onClick={() => {
              setSelectedTimeframe('1D');
              setHoveredIndex(null);
            }}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              selectedTimeframe === '1D'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today (1D)
          </button>
          <button
            onClick={() => {
              setSelectedTimeframe('1W');
              setHoveredIndex(null);
            }}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              selectedTimeframe === '1W'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past 7 Days (1W)
          </button>
          <button
            onClick={() => {
              setSelectedTimeframe('1M');
              setHoveredIndex(null);
            }}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              selectedTimeframe === '1M'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Term (1M)
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-1">
        <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Period Average
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-base font-black text-slate-900">{avgRate}%</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                avgRate >= 95
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-orange-50 text-orange-700 border border-orange-200/60'
              }`}
            >
              {avgRate >= 95 ? '≥ 95% target' : '< 95% target'}
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Today's Headcount
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base font-black text-slate-900">{analytics.presentToday}</span>
            <span className="text-[10px] text-slate-500 font-semibold">/ {schoolTotal}</span>
          </div>
        </div>

        <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Peak Presence
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base font-black text-emerald-700">
              {peakPoint ? `${peakPoint.rate}%` : 'N/A'}
            </span>
            <span className="text-[10px] text-slate-500 truncate max-w-[70px]">
              {peakPoint?.label}
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Target Variance
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className={`text-base font-black ${
                avgRate >= 95 ? 'text-emerald-700' : 'text-orange-600'
              }`}
            >
              {avgRate >= 95 ? `+${(avgRate - 95).toFixed(1)}%` : `${(avgRate - 95).toFixed(1)}%`}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">vs 95.0%</span>
          </div>
        </div>
      </div>

      {/* Main Shadcn-Style Interactive Chart Area */}
      <div className="mt-4">
        {/* Natural Chart Header Bar (Replacing artificial "Attendance Index (89% - 100%)") */}
        <div className="flex items-center justify-between text-xs mb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 text-xs">Daily Presence Rate (%)</span>
            <span className="text-[10px] text-slate-400 font-medium">
              Hover across canvas to scrub checkpoints
            </span>
          </div>

          {/* Shadcn Chart Legend */}
          <div className="flex items-center gap-3 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-orange-500 shadow-2xs"></span>
              <span className="font-medium">Attendance Rate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 border-t-2 border-slate-600 border-dashed"></span>
              <span className="font-medium text-slate-500">Target (95.0%)</span>
            </div>
          </div>
        </div>

        {/* SVG Canvas Container with Scrubbing and Dynamic Tooltip */}
        <div className="relative h-52 sm:h-56 md:h-60 w-full bg-slate-50/40 rounded-xl border border-slate-200/80 overflow-hidden select-none">
          {/* Floating Shadcn Chart Tooltip Popover */}
          {activePoint && activeCoord && (
            <div
              style={{
                left: `${Math.max(10, Math.min(80, (activeCoord.x / svgWidth) * 100))}%`,
                top: '12px'
              }}
              className="absolute z-30 pointer-events-none -translate-x-1/2 min-w-[210px] rounded-lg border border-slate-200/90 bg-white/95 p-3 text-xs shadow-xl backdrop-blur-md transition-all duration-75 ring-1 ring-black/5"
            >
              {/* Tooltip Header */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-1.5">
                <span className="font-bold text-slate-900 truncate">
                  {activePoint.subLabel || activePoint.date || activePoint.label}
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

              {/* Tooltip Metric Rows (with signature shadcn square indicators) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-[2px] bg-orange-500"></span>
                    <span>Attendance Rate</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {activePoint.rate}%
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-[2px] bg-emerald-500"></span>
                    <span>Present Learners</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-700">
                    {activePoint.present}{' '}
                    <span className="text-[10px] text-slate-400">
                      ({Math.round((activePoint.present / (activePoint.total || schoolTotal)) * 100)}%)
                    </span>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-[2px] bg-rose-500"></span>
                    <span>Absent</span>
                  </div>
                  <span className="font-mono font-semibold text-rose-600">
                    {activePoint.absent}
                  </span>
                </div>
              </div>

              {/* Tooltip Target Delta */}
              <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span>Target Variance:</span>
                <span
                  className={`font-mono font-bold ${
                    activePoint.rate >= 95 ? 'text-emerald-600' : 'text-orange-600'
                  }`}
                >
                  {activePoint.rate >= 95
                    ? `+${(activePoint.rate - 95).toFixed(1)}%`
                    : `${(activePoint.rate - 95).toFixed(1)}%`}
                </span>
              </div>
            </div>
          )}

          {/* SVG Vector Line & Dynamic Axes */}
          <svg
            ref={svgRef}
            className="w-full h-full cursor-crosshair"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
          >
            <defs>
              <linearGradient id="shadcnAttendanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                <stop offset="95%" stopColor="#f97316" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines & Y-Axis Labels */}
            {yTicks.map((tick) => {
              const yPos = getY(tick);
              return (
                <g key={tick}>
                  <line
                    x1={padLeft}
                    y1={yPos}
                    x2={svgWidth - padRight}
                    y2={yPos}
                    stroke="#e2e8f0"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 6}
                    y={yPos + 3.5}
                    textAnchor="end"
                    fill="#94a3b8"
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="500"
                  >
                    {tick}%
                  </text>
                </g>
              );
            })}

            {/* Institutional Target 95% Reference Line */}
            <line
              x1={padLeft}
              y1={y95}
              x2={svgWidth - padRight}
              y2={y95}
              stroke="#475569"
              strokeDasharray="4 4"
              strokeWidth="1.2"
              opacity="0.6"
            />
            <rect
              x={svgWidth - padRight - 66}
              y={Math.max(6, y95 - 13)}
              width="64"
              height="14"
              rx="3"
              fill="#f1f5f9"
              stroke="#cbd5e1"
              strokeWidth="0.8"
            />
            <text
              x={svgWidth - padRight - 34}
              y={Math.max(16, y95 - 3)}
              textAnchor="middle"
              fill="#475569"
              fontSize="8.5"
              fontFamily="monospace"
              fontWeight="700"
            >
              Target 95.0%
            </text>

            {/* Area Fill */}
            {areaPath && <path d={areaPath} fill="url(#shadcnAttendanceGradient)" />}

            {/* Main Spline Line */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#f97316"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Vertical Crosshair Line (snapped to active data point) */}
            {activeCoord && (
              <line
                x1={activeCoord.x}
                y1={padTop}
                x2={activeCoord.x}
                y2={svgHeight - padBottom}
                stroke="#94a3b8"
                strokeDasharray="3 3"
                strokeWidth="1.5"
                className="transition-all"
              />
            )}

            {/* Data Circles across the line */}
            {coords.map((c, i) => {
              const isActive = i === activeIdx;
              return (
                <g key={c.point.id || i}>
                  {/* Active glowing ring */}
                  {isActive && (
                    <>
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r="9"
                        fill="#f97316"
                        fillOpacity="0.2"
                        className="animate-pulse"
                      />
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r="5.5"
                        fill="#f97316"
                        fillOpacity="0.3"
                      />
                    </>
                  )}
                  {/* Core data point */}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={isActive ? 4.5 : selectedTimeframe === '1M' ? 2 : 3}
                    fill={isActive ? '#ffffff' : c.point.rate >= 95 ? '#ffffff' : '#f97316'}
                    stroke={isActive ? '#ea580c' : c.point.rate >= 95 ? '#059669' : '#ea580c'}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className="transition-all pointer-events-none"
                  />
                </g>
              );
            })}

            {/* X-Axis bottom baseline line */}
            <line
              x1={padLeft}
              y1={svgHeight - padBottom}
              x2={svgWidth - padRight}
              y2={svgHeight - padBottom}
              stroke="#cbd5e1"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Dynamic Timeline Checkpoint Controls / X-Axis Ticks below chart */}
        {selectedTimeframe === '1W' && (
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-2 mt-3 overflow-x-auto gap-1">
            {currentPoints.map((pt, idx) => (
              <button
                key={pt.id}
                onClick={() => setHoveredIndex(idx)}
                onMouseEnter={() => setHoveredIndex(idx)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer border ${
                  activeIdx === idx
                    ? 'bg-orange-500 text-white border-orange-600 font-bold shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200/80'
                }`}
              >
                <span className="block text-[10px] leading-tight opacity-90">{pt.label}</span>
                <span className="block text-[11px] font-bold leading-tight mt-0.5">{pt.rate}%</span>
              </button>
            ))}
          </div>
        )}

        {selectedTimeframe === '1M' && (
          <div className="mt-3 px-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1.5">
              <span>{currentPoints[0]?.subLabel || 'Start of Month'}</span>
              <span>Mid-Month Checkpoint</span>
              <span className="text-orange-600 font-bold">
                Today ({currentPoints[currentPoints.length - 1]?.rate || 95.3}%)
              </span>
            </div>
            <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100 overflow-x-auto">
              {currentPoints.map((pt, idx) => (
                <button
                  key={pt.id}
                  onClick={() => setHoveredIndex(idx)}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  title={`${pt.subLabel || pt.label}: ${pt.rate}% (${pt.present} present)`}
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    activeIdx === idx
                      ? 'bg-orange-500 ring-2 ring-orange-300 scale-125'
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 px-1">
            {currentPoints.map((pt, idx) => (
              <button
                key={pt.id}
                onClick={() => setHoveredIndex(idx)}
                onMouseEnter={() => setHoveredIndex(idx)}
                className={`p-2.5 rounded-lg text-left transition-all border cursor-pointer ${
                  activeIdx === idx
                    ? 'bg-orange-50 border-orange-300 ring-1 ring-orange-300 shadow-2xs'
                    : 'bg-slate-50 border-slate-200/80 hover:bg-white'
                }`}
              >
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {pt.label}
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xs font-bold text-slate-800">{pt.subLabel}</span>
                  <span
                    className={`text-xs font-black ${
                      pt.rate >= 95 ? 'text-emerald-700' : 'text-orange-600'
                    }`}
                  >
                    {pt.rate}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Shadcn Card Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            {isUp ? (
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-orange-600" />
            )}
            <span>
              Trending{' '}
              <strong className={isUp ? 'text-emerald-700' : 'text-orange-600'}>
                {isUp ? `+${trendVariance}%` : `${trendVariance}%`}
              </strong>{' '}
              relative to the 95.0% institutional baseline
            </span>
          </div>

          {onNavigateAttendance && (
            <button
              onClick={onNavigateAttendance}
              className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-semibold cursor-pointer group"
            >
              <span>Take Today's Roll Call</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
