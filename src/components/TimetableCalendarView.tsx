import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  BookOpen,
  Plus,
  Trash2,
  CheckCircle,
  X,
  Sparkles,
  CalendarDays,
  Printer,
  Info,
  Layers,
  GraduationCap
} from 'lucide-react';
import { TimetableSlot, UserRole } from '../types';

interface TimetableCalendarViewProps {
  slots: TimetableSlot[];
  viewMode: 'class' | 'teacher';
  selectedGrade: string;
  selectedTeacher: string;
  selectedTeacherFilter: string;
  onAddSlot: (slot: Partial<TimetableSlot>) => Promise<void>;
  onDeleteSlot: (id: string) => Promise<void>;
  onOpenAddModalWithDay?: (day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday', periodIndex?: number) => void;
  userRole: UserRole;
}

// Subject color styling map
export const getSubjectColor = (subject: string) => {
  const s = subject.toLowerCase();
  if (s.includes('math')) {
    return {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-800',
      dot: 'bg-blue-500',
      hover: 'hover:bg-blue-100'
    };
  }
  if (s.includes('physic')) {
    return {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      badge: 'bg-purple-100 text-purple-800',
      dot: 'bg-purple-500',
      hover: 'hover:bg-purple-100'
    };
  }
  if (s.includes('chem')) {
    return {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      badge: 'bg-emerald-100 text-emerald-800',
      dot: 'bg-emerald-500',
      hover: 'hover:bg-emerald-100'
    };
  }
  if (s.includes('bio')) {
    return {
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      text: 'text-teal-700',
      badge: 'bg-teal-100 text-teal-800',
      dot: 'bg-teal-500',
      hover: 'hover:bg-teal-100'
    };
  }
  if (s.includes('eng') || s.includes('lit')) {
    return {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      badge: 'bg-amber-100 text-amber-900',
      dot: 'bg-amber-500',
      hover: 'hover:bg-amber-100'
    };
  }
  if (s.includes('hist') || s.includes('geog') || s.includes('social')) {
    return {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-700',
      badge: 'bg-rose-100 text-rose-800',
      dot: 'bg-rose-500',
      hover: 'hover:bg-rose-100'
    };
  }
  if (s.includes('pe') || s.includes('sport') || s.includes('phys')) {
    return {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      badge: 'bg-orange-100 text-orange-800',
      dot: 'bg-orange-500',
      hover: 'hover:bg-orange-100'
    };
  }
  if (s.includes('comp') || s.includes('ict')) {
    return {
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
      text: 'text-cyan-700',
      badge: 'bg-cyan-100 text-cyan-800',
      dot: 'bg-cyan-500',
      hover: 'hover:bg-cyan-100'
    };
  }
  return {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-700',
    badge: 'bg-indigo-100 text-indigo-800',
    dot: 'bg-indigo-500',
    hover: 'hover:bg-indigo-100'
  };
};

const PERIOD_SCHEDULE = [
  { index: 1, time: '08:00 - 08:45', name: 'Period 1' },
  { index: 2, time: '08:45 - 09:30', name: 'Period 2' },
  { index: 0, time: '09:30 - 09:50', name: 'Morning Break', isBreak: true, icon: '☕' },
  { index: 3, time: '09:50 - 10:35', name: 'Period 3' },
  { index: 4, time: '10:35 - 11:20', name: 'Period 4' },
  { index: 0, time: '11:20 - 11:40', name: 'Midday Recess', isBreak: true, icon: '🥪' },
  { index: 5, time: '11:40 - 12:25', name: 'Period 5' },
  { index: 0, time: '12:25 - 13:30', name: 'Lunch & Clubs', isBreak: true, icon: '🍱' },
  { index: 6, time: '13:30 - 14:15', name: 'Period 6' },
  { index: 7, time: '14:15 - 15:00', name: 'Period 7' }
];

export const TimetableCalendarView: React.FC<TimetableCalendarViewProps> = ({
  slots,
  viewMode,
  selectedGrade,
  selectedTeacher,
  selectedTeacherFilter,
  onDeleteSlot,
  onOpenAddModalWithDay,
  userRole
}) => {
  // Calendar Month State (Defaults to September 2026)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 17)); // Sep 17, 2026
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 8, 17));
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [activeSlotModal, setActiveSlotModal] = useState<TimetableSlot | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date(2026, 8, 17);
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Filter slots according to active selection
  const relevantSlots = useMemo(() => {
    return slots.filter((slot) => {
      // Teacher mode
      if (viewMode === 'teacher') {
        const activeTeacher = selectedTeacherFilter !== 'all' ? selectedTeacherFilter : selectedTeacher;
        if (slot.teacherName.toLowerCase() !== activeTeacher.toLowerCase()) return false;
      } else {
        // Class mode
        if (slot.grade.toLowerCase() !== selectedGrade.toLowerCase()) return false;
        if (selectedTeacherFilter !== 'all') {
          if (slot.teacherName.toLowerCase() !== selectedTeacherFilter.toLowerCase()) return false;
        }
      }

      // Subject filter
      if (selectedSubjectFilter !== 'all') {
        if (slot.subject.toLowerCase() !== selectedSubjectFilter.toLowerCase()) return false;
      }

      return true;
    });
  }, [slots, viewMode, selectedGrade, selectedTeacher, selectedTeacherFilter, selectedSubjectFilter]);

  // Unique subjects available for filtering
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    slots.forEach((s) => set.add(s.subject));
    return Array.from(set).sort();
  }, [slots]);

  // Map slots by day of week for fast lookup
  const slotsByDay = useMemo(() => {
    const map: Record<string, TimetableSlot[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    };
    relevantSlots.forEach((slot) => {
      if (map[slot.dayOfWeek]) {
        map[slot.dayOfWeek].push(slot);
      }
    });
    // Sort each day's slots by periodIndex
    Object.keys(map).forEach((day) => {
      map[day].sort((a, b) => a.periodIndex - b.periodIndex);
    });
    return map;
  }, [relevantSlots]);

  // Generate Calendar Grid Data
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Monday-based indexing: Sunday=6, Monday=0, Tuesday=1, etc.
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;

    // Previous month filler days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      dayOfWeekName: string;
      isWeekend: boolean;
      slots: TimetableSlot[];
    }> = [];

    // Prepend previous month days
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
      const dayNum = prevDate.getDay();
      const isWeekend = dayNum === 0 || dayNum === 6;
      const dayOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayOfWeekNames[dayNum];

      days.push({
        date: prevDate,
        isCurrentMonth: false,
        dayOfWeekName: dayName,
        isWeekend,
        slots: isWeekend ? [] : slotsByDay[dayName] || []
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = new Date(year, month, d);
      const dayNum = curDate.getDay();
      const isWeekend = dayNum === 0 || dayNum === 6;
      const dayOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayOfWeekNames[dayNum];

      days.push({
        date: curDate,
        isCurrentMonth: true,
        dayOfWeekName: dayName,
        isWeekend,
        slots: isWeekend ? [] : slotsByDay[dayName] || []
      });
    }

    // Postpend next month days to complete 35 or 42 grid cells
    const remainingDays = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dayNum = nextDate.getDay();
      const isWeekend = dayNum === 0 || dayNum === 6;
      const dayOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayOfWeekNames[dayNum];

      days.push({
        date: nextDate,
        isCurrentMonth: false,
        dayOfWeekName: dayName,
        isWeekend,
        slots: isWeekend ? [] : slotsByDay[dayName] || []
      });
    }

    return days;
  }, [year, month, slotsByDay]);

  // Month Statistics
  const monthStats = useMemo(() => {
    let teachingDays = 0;
    let totalLessons = 0;

    calendarDays.forEach((day) => {
      if (day.isCurrentMonth && !day.isWeekend) {
        teachingDays++;
        totalLessons += day.slots.length;
      }
    });

    const teachingHours = Math.round((totalLessons * 45) / 60);

    return {
      teachingDays,
      totalLessons,
      teachingHours,
      activeSubjects: availableSubjects.length
    };
  }, [calendarDays, availableSubjects]);

  // Selected Day Details
  const selectedDayInfo = useMemo(() => {
    const dayNum = selectedDate.getDay();
    const isWeekend = dayNum === 0 || dayNum === 6;
    const dayOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayOfWeekNames[dayNum] as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    const daySlots = isWeekend ? [] : slotsByDay[dayName] || [];

    return {
      date: selectedDate,
      dayName,
      isWeekend,
      slots: daySlots,
      dateString: selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    };
  }, [selectedDate, slotsByDay]);

  // Month display title
  const monthTitle = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Helper to check if a date is today
  const isToday = (d: Date) => {
    const today = new Date(2026, 8, 17);
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  // Helper to check if date is selected
  const isSelected = (d: Date) => {
    return (
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <div className="space-y-6">
      {/* Month Navigation & Summary Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Month Title & Nav */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-bold rounded-lg hover:bg-white text-slate-700 transition-all cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 font-serif tracking-tight flex items-center gap-2">
                <span>{monthTitle}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200">
                  {viewMode === 'class' ? selectedGrade : selectedTeacher}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Monthly lesson recurrence matrix & daily timetable allocation
              </p>
            </div>
          </div>

          {/* Quick Subject Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-[11px] font-bold text-slate-400 shrink-0">Subject:</span>
            <button
              type="button"
              onClick={() => setSelectedSubjectFilter('all')}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer shrink-0 ${
                selectedSubjectFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Subjects
            </button>
            {availableSubjects.map((sub) => {
              const color = getSubjectColor(sub);
              const isActive = selectedSubjectFilter === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubjectFilter(sub)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer shrink-0 border ${
                    isActive
                      ? `${color.badge} border-current font-bold shadow-xs`
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>

        {/* Monthly Key Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Teaching Days</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-black text-slate-900">{monthStats.teachingDays}</span>
              <span className="text-[11px] text-slate-500 font-medium">school days</span>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Total Lessons</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-black text-orange-600">{monthStats.totalLessons}</span>
              <span className="text-[11px] text-slate-500 font-medium">periods scheduled</span>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Contact Hours</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-black text-slate-900">{monthStats.teachingHours}</span>
              <span className="text-[11px] text-slate-500 font-medium">instructional hrs</span>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Active Subjects</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-black text-emerald-700">{monthStats.activeSubjects}</span>
              <span className="text-[11px] text-slate-500 font-medium">curriculum units</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid & Day Detail Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Top: Monthly Calendar Grid (8 cols on large screen) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
          {/* Weekday Header Columns */}
          <div className="grid grid-cols-7 bg-slate-900 text-white text-center font-bold text-xs py-2.5">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
              <div key={day} className={idx >= 5 ? 'text-slate-400 font-medium' : ''}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-px bg-slate-200 flex-1">
            {calendarDays.map((dayItem, index) => {
              const dayDate = dayItem.date;
              const dateNumber = dayDate.getDate();
              const today = isToday(dayDate);
              const selected = isSelected(dayDate);

              return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(dayDate)}
                  className={`min-h-[92px] sm:min-h-[108px] md:min-h-[120px] p-1.5 sm:p-2 flex flex-col justify-between transition-all cursor-pointer relative group ${
                    !dayItem.isCurrentMonth
                      ? 'bg-slate-50/50 text-slate-300'
                      : dayItem.isWeekend
                      ? 'bg-slate-50/80 text-slate-400'
                      : 'bg-white hover:bg-orange-50/30'
                  } ${
                    selected
                      ? 'ring-2 ring-orange-500 ring-inset bg-orange-50/40 z-10'
                      : ''
                  }`}
                >
                  {/* Top Day Header: Number + Indicator */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                        today
                          ? 'bg-orange-500 text-white font-black shadow-xs'
                          : selected
                          ? 'bg-orange-100 text-orange-900 font-bold'
                          : dayItem.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {dateNumber}
                    </span>

                    {/* Today Badge or Lesson Count */}
                    {today ? (
                      <span className="text-[9px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                        Today
                      </span>
                    ) : dayItem.slots.length > 0 && dayItem.isCurrentMonth ? (
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-orange-600 transition-colors">
                        {dayItem.slots.length}L
                      </span>
                    ) : null}
                  </div>

                  {/* Day Content / Lesson Pills */}
                  <div className="mt-1 space-y-1 overflow-hidden flex-1 flex flex-col justify-start">
                    {dayItem.isWeekend ? (
                      <div className="h-full flex items-center justify-center">
                        <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-300 select-none">
                          Weekend
                        </span>
                      </div>
                    ) : dayItem.slots.length > 0 ? (
                      <>
                        {dayItem.slots.slice(0, 3).map((slot) => {
                          const col = getSubjectColor(slot.subject);
                          return (
                            <div
                              key={slot.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDate(dayDate);
                                setActiveSlotModal(slot);
                              }}
                              className={`px-1.5 py-0.5 rounded text-[10px] truncate border font-medium flex items-center gap-1 transition-all ${col.bg} ${col.border} ${col.text} ${col.hover} cursor-pointer`}
                              title={`Period ${slot.periodIndex} (${slot.startTime}): ${slot.subject} - ${slot.teacherName} in ${slot.room}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${col.dot} shrink-0`} />
                              <span className="font-bold shrink-0">P{slot.periodIndex}</span>
                              <span className="truncate">{slot.subject}</span>
                            </div>
                          );
                        })}

                        {dayItem.slots.length > 3 && (
                          <div className="text-[9px] font-bold text-slate-500 pl-1">
                            +{dayItem.slots.length - 3} more lessons
                          </div>
                        )}
                      </>
                    ) : dayItem.isCurrentMonth ? (
                      <div className="h-full flex items-center justify-center">
                        <span className="text-[10px] text-slate-300 italic">No classes</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right / Bottom: Selected Day Schedule Inspector (4 cols on large screen) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-full">
            {/* Header of Day Inspector */}
            <div className="pb-3 border-b border-slate-100 flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-orange-500" />
                  <h3 className="text-sm font-bold text-slate-900 font-serif">
                    Day Schedule Inspector
                  </h3>
                </div>
                <p className="text-xs font-semibold text-slate-600 mt-1">
                  {selectedDayInfo.dateString}
                </p>
              </div>

              {/* Status Chip */}
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedDayInfo.isWeekend
                    ? 'bg-slate-100 text-slate-600'
                    : selectedDayInfo.slots.length > 0
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {selectedDayInfo.isWeekend
                  ? 'Off-Session'
                  : `${selectedDayInfo.slots.length} Lessons`}
              </span>
            </div>

            {/* Target Details Badge */}
            <div className="py-2.5 px-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between mt-3">
              <div className="flex items-center gap-1.5 text-slate-600">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium">Active Target:</span>
              </div>
              <span className="font-bold text-slate-900">
                {viewMode === 'class' ? selectedGrade : selectedTeacher}
              </span>
            </div>

            {/* Chronological Day Timeline */}
            <div className="mt-4 space-y-2.5 flex-1 overflow-y-auto max-h-[520px] pr-1">
              {selectedDayInfo.isWeekend ? (
                <div className="p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400 space-y-2">
                  <CalendarDays className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold text-slate-700">Weekend / Non-Teaching Day</p>
                  <p className="text-[11px] text-slate-400">
                    No regular instructional periods or master curriculum sessions scheduled.
                  </p>
                </div>
              ) : (
                PERIOD_SCHEDULE.map((period, pIdx) => {
                  if (period.isBreak) {
                    return (
                      <div
                        key={pIdx}
                        className="px-3 py-2 bg-amber-50/60 rounded-xl border border-amber-100/80 flex items-center justify-between text-xs text-amber-900"
                      >
                        <div className="flex items-center gap-2">
                          <span>{period.icon}</span>
                          <span className="font-bold text-[11px] uppercase tracking-wider text-amber-800">
                            {period.name}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-amber-700 font-semibold">{period.time}</span>
                      </div>
                    );
                  }

                  const matchedSlot = selectedDayInfo.slots.find(
                    (s) => s.periodIndex === period.index
                  );

                  if (matchedSlot) {
                    const color = getSubjectColor(matchedSlot.subject);
                    return (
                      <div
                        key={pIdx}
                        onClick={() => setActiveSlotModal(matchedSlot)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer group ${color.bg} ${color.border} hover:shadow-xs`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono font-bold text-slate-500">
                                {period.time}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/80 font-bold text-slate-600 border border-slate-200/60">
                                {period.name}
                              </span>
                            </div>
                            <h4 className="text-xs font-black text-slate-900 mt-1">
                              {matchedSlot.subject}
                            </h4>
                          </div>

                          {userRole === 'admin' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSlot(matchedSlot.id);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              title="Delete this lesson slot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Room & Teacher Info */}
                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/50 text-[11px]">
                          <div className="flex items-center gap-1 text-slate-600 truncate">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate font-medium">
                              {viewMode === 'class' ? matchedSlot.teacherName : matchedSlot.grade}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-600 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{matchedSlot.room}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Empty Slot
                  return (
                    <div
                      key={pIdx}
                      className="p-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400 font-semibold">{period.time}</span>
                        <span className="text-slate-400 font-medium text-[11px]">{period.name}: Free Period</span>
                      </div>

                      {userRole === 'admin' && onOpenAddModalWithDay && (
                        <button
                          type="button"
                          onClick={() => {
                            if (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(selectedDayInfo.dayName)) {
                              onOpenAddModalWithDay(
                                selectedDayInfo.dayName as any,
                                period.index
                              );
                            }
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Assign</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Quick Action */}
            {userRole === 'admin' && !selectedDayInfo.isWeekend && onOpenAddModalWithDay && (
              <div className="pt-3 mt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    if (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(selectedDayInfo.dayName)) {
                      onOpenAddModalWithDay(selectedDayInfo.dayName as any);
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold text-xs border border-orange-200 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Lesson on {selectedDayInfo.dayName}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lesson Details Dialog / Popover */}
      {activeSlotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${getSubjectColor(activeSlotModal.subject).bg}`}>
                  <BookOpen className={`w-5 h-5 ${getSubjectColor(activeSlotModal.subject).text}`} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">
                    {activeSlotModal.subject}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeSlotModal.dayOfWeek} • {activeSlotModal.periodName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSlotModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Schedule Time:</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {activeSlotModal.startTime} - {activeSlotModal.endTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Class / Grade:</span>
                  <span className="font-bold text-slate-800">{activeSlotModal.grade}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Assigned Teacher:</span>
                  <span className="font-bold text-indigo-700">{activeSlotModal.teacherName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Allocated Room:</span>
                  <span className="font-bold text-slate-800">{activeSlotModal.room}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2 text-[11px]">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Verified Session Schedule</span>
                  <span>No room collisions or double-booked teacher periods detected.</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              {userRole === 'admin' ? (
                <button
                  type="button"
                  onClick={async () => {
                    await onDeleteSlot(activeSlotModal.id);
                    setActiveSlotModal(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Slot</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => setActiveSlotModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
