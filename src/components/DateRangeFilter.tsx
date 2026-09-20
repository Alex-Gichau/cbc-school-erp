import React from 'react';
import { Calendar, X, Filter, RotateCcw } from 'lucide-react';

export interface DatePreset {
  label: string;
  startDate: string;
  endDate: string;
}

export const DEFAULT_DATE_PRESETS: DatePreset[] = [
  { label: 'All Records', startDate: '', endDate: '' },
  { label: 'Today (16 Mar)', startDate: '2026-03-16', endDate: '2026-03-16' },
  { label: 'Last 7 Days', startDate: '2026-03-10', endDate: '2026-03-16' },
  { label: 'Last 30 Days', startDate: '2026-02-15', endDate: '2026-03-16' },
  { label: 'March 2026', startDate: '2026-03-01', endDate: '2026-03-31' },
  { label: 'February 2026', startDate: '2026-02-01', endDate: '2026-02-28' },
  { label: 'January 2026', startDate: '2026-01-01', endDate: '2026-01-31' },
  { label: 'Term 1 Full (Jan–Apr 2026)', startDate: '2026-01-05', endDate: '2026-04-10' },
];

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onDateRangeChange: (start: string, end: string) => void;
  presets?: DatePreset[];
  label?: string;
  helperText?: string;
  matchedCount?: number;
  totalCount?: number;
  entityLabel?: string;
  className?: string;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onDateRangeChange,
  presets = DEFAULT_DATE_PRESETS,
  label = 'Historical Time Frame Filter',
  helperText,
  matchedCount,
  totalCount,
  entityLabel = 'records',
  className = ''
}) => {
  const isFilterActive = Boolean(startDate || endDate);

  // Check which preset is active
  const activePreset = presets.find(
    (p) => p.startDate === startDate && p.endDate === endDate
  );

  const handleSelectPreset = (p: DatePreset) => {
    onDateRangeChange(p.startDate, p.endDate);
  };

  const handleClear = () => {
    onDateRangeChange('', '');
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className={`bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 ${className}`}
    >
      {/* Top row: Title and current status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">{label}</span>
              {isFilterActive ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                  <span>Filtered: {activePreset ? activePreset.label : `${formatDateDisplay(startDate)} → ${formatDateDisplay(endDate)}`}</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                  All Time / Complete History
                </span>
              )}
            </div>
            {helperText && (
              <p className="text-[11px] text-slate-500 mt-0.5">{helperText}</p>
            )}
          </div>
        </div>

        {/* Count badge & reset */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {matchedCount !== undefined && totalCount !== undefined && (
            <span className="text-[11px] font-medium text-slate-500">
              Showing <strong className="font-bold text-slate-900">{matchedCount}</strong> of {totalCount} {entityLabel}
            </span>
          )}
          {isFilterActive && (
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              title="Reset date filter to view all historical records"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Date Pickers and Quick Select Presets */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 pt-1 border-t border-slate-100">
        {/* Date Inputs */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
              From:
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onDateRangeChange(e.target.value, endDate)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-slate-800 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
              To:
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onDateRangeChange(startDate, e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-slate-800 transition-colors"
            />
          </div>
        </div>

        {/* Vertical divider on md screens */}
        <div className="hidden md:block w-px h-6 bg-slate-200" />

        {/* Quick Presets Pills */}
        <div className="flex items-center gap-1.5 flex-wrap flex-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden lg:inline">
            Presets:
          </span>
          {presets.map((p) => {
            const isSelected = p.startDate === startDate && p.endDate === endDate;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-orange-500 text-white shadow-xs font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/70'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
