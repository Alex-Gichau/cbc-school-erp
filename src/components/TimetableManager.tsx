import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Calendar,
  Table2,
  Plus,
  Printer,
  Trash2,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  ShieldAlert,
  Building2,
  X,
  Filter
} from 'lucide-react';
import { TimetableSlot, UserRole } from '../types';
import { TimetableCalendarView } from './TimetableCalendarView';

const TEACHER_MAP: Record<string, string> = {
  'Sarah Jenkins': 'user_teacher_1',
  'Marcus Vance': 'user_teacher_2',
  'Dr. Helen Oloo': 'user_teacher_3',
  'Claire Kamau': 'user_teacher_5',
  'Coach Eric Simiyu': 'user_teacher_6',
  'Antony Barasa': 'user_teacher_7',
  'Jane Wambui': 'user_teacher_8'
};

interface TimetableManagerProps {
  slots: TimetableSlot[];
  onAddSlot: (slot: Partial<TimetableSlot>) => Promise<void>;
  onDeleteSlot: (id: string) => Promise<void>;
  userRole: UserRole;
}

export const TimetableManager: React.FC<TimetableManagerProps> = ({
  slots,
  onAddSlot,
  onDeleteSlot,
  userRole
}) => {
  const [layoutMode, setLayoutMode] = useState<'monthly' | 'weekly'>('monthly');
  const [viewMode, setViewMode] = useState<'class' | 'teacher'>('class');
  const [selectedGrade, setSelectedGrade] = useState('Grade 10-A');
  const [selectedTeacher, setSelectedTeacher] = useState('Sarah Jenkins');
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [conflictError, setConflictError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available unique teachers across all scheduled slots
  const availableTeachers = useMemo(() => {
    const teacherSet = new Set<string>();
    slots.forEach((s) => {
      if (s.teacherName) teacherSet.add(s.teacherName);
    });
    // Ensure core school faculty members are always selectable
    ['Sarah Jenkins', 'Marcus Vance', 'Dr. Helen Oloo', 'Claire Kamau'].forEach((t) => teacherSet.add(t));
    return Array.from(teacherSet).sort();
  }, [slots]);

  // Available unique grades across all scheduled slots
  const availableGrades = useMemo(() => {
    const gradeSet = new Set<string>();
    slots.forEach((s) => {
      if (s.grade) gradeSet.add(s.grade);
    });
    ['Grade 9-A', 'Grade 10-A', 'Grade 11-A', 'Grade 12-A'].forEach((g) => gradeSet.add(g));
    return Array.from(gradeSet).sort();
  }, [slots]);

  // New slot form
  const [formData, setFormData] = useState({
    dayOfWeek: 'Monday' as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday',
    periodIndex: 1,
    grade: 'Grade 10-A',
    subject: 'Mathematics',
    teacherName: 'Sarah Jenkins',
    teacherId: 'user_teacher_1',
    room: 'Room 204'
  });

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday'
  ];

  const periodSlots = [
    { index: 1, time: '08:00 - 08:45', name: 'Period 1' },
    { index: 2, time: '08:45 - 09:30', name: 'Period 2' },
    { index: 0, time: '09:30 - 09:50', name: 'Morning Break', isBreak: true },
    { index: 3, time: '09:50 - 10:35', name: 'Period 3' },
    { index: 4, time: '10:35 - 11:20', name: 'Period 4' },
    { index: 0, time: '11:20 - 11:40', name: 'Midday Recess', isBreak: true },
    { index: 5, time: '11:40 - 12:25', name: 'Period 5' },
    { index: 0, time: '12:25 - 13:30', name: 'Lunch & Clubs', isBreak: true },
    { index: 6, time: '13:30 - 14:15', name: 'Period 6' },
    { index: 7, time: '14:15 - 15:00', name: 'Period 7' }
  ];

  const filteredSlots = slots.filter((slot) => {
    if (viewMode === 'teacher') {
      const activeTeacher = selectedTeacherFilter !== 'all' ? selectedTeacherFilter : selectedTeacher;
      return slot.teacherName.toLowerCase() === activeTeacher.toLowerCase();
    } else {
      // Class view
      const matchesGrade = slot.grade.toLowerCase() === selectedGrade.toLowerCase();
      if (!matchesGrade) return false;

      // When teacher filter is active, only show slots associated with that specific selected teacher
      if (selectedTeacherFilter !== 'all') {
        return slot.teacherName.toLowerCase() === selectedTeacherFilter.toLowerCase();
      }

      return true;
    }
  });

  // List of standard campus classrooms and specialized facilities
  const standardRooms = useMemo(() => {
    const roomSet = new Set<string>();
    slots.forEach((s) => {
      if (s.room) roomSet.add(s.room.trim());
    });
    [
      'Room 204 (Science Wing)',
      'Room 102',
      'Room 108',
      'Physics Lab A',
      'Chemistry Lab B',
      'Biology Lab 1',
      'Digital Lab 2',
      'School Sports Field',
      'Library Seminar Room',
      'Art & Music Studio'
    ].forEach((r) => roomSet.add(r));
    return Array.from(roomSet).sort();
  }, [slots]);

  // Real-time booking collision & availability validation
  const validationStatus = useMemo(() => {
    const pIndex = Number(formData.periodIndex);
    const day = formData.dayOfWeek;
    const cleanRoom = formData.room.trim().toLowerCase();
    const cleanTeacher = formData.teacherName.trim().toLowerCase();
    const cleanGrade = formData.grade.trim().toLowerCase();

    // 1. Teacher Booking Conflict Check
    const teacherConflict = slots.find(
      (s) =>
        s.dayOfWeek === day &&
        s.periodIndex === pIndex &&
        (s.teacherName.trim().toLowerCase() === cleanTeacher ||
          (formData.teacherId && s.teacherId === formData.teacherId))
    );

    // 2. Classroom Booking Conflict Check
    const roomConflict = cleanRoom
      ? slots.find(
          (s) =>
            s.dayOfWeek === day &&
            s.periodIndex === pIndex &&
            (s.room.trim().toLowerCase() === cleanRoom ||
              s.room.trim().toLowerCase().includes(cleanRoom) ||
              cleanRoom.includes(s.room.trim().toLowerCase()))
        )
      : null;

    // 3. Class / Grade Schedule Conflict Check
    const gradeConflict = slots.find(
      (s) =>
        s.dayOfWeek === day &&
        s.periodIndex === pIndex &&
        s.grade.trim().toLowerCase() === cleanGrade
    );

    // Identify which rooms are currently free during this specific day and period
    const bookedRoomsThisPeriod = new Set(
      slots
        .filter((s) => s.dayOfWeek === day && s.periodIndex === pIndex)
        .map((s) => s.room.trim().toLowerCase())
    );
    const availableRooms = standardRooms.filter(
      (r) => !bookedRoomsThisPeriod.has(r.toLowerCase())
    );

    // Identify which periods this specific teacher is completely free on this day
    const teacherBookedPeriods = new Set(
      slots
        .filter(
          (s) =>
            s.dayOfWeek === day &&
            (s.teacherName.trim().toLowerCase() === cleanTeacher ||
              (formData.teacherId && s.teacherId === formData.teacherId))
        )
        .map((s) => s.periodIndex)
    );
    const teacherFreePeriods = periodSlots
      .filter((p) => !p.isBreak && !teacherBookedPeriods.has(p.index))
      .map((p) => ({ index: p.index, name: p.name, time: p.time }));

    const hasConflict = Boolean(teacherConflict || roomConflict || gradeConflict);

    return {
      hasConflict,
      teacherConflict,
      roomConflict,
      gradeConflict,
      availableRooms,
      teacherFreePeriods
    };
  }, [formData, slots, standardRooms, periodSlots]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError('');

    // Block submission if conflict exists
    if (validationStatus.hasConflict) {
      if (validationStatus.teacherConflict && validationStatus.roomConflict) {
        setConflictError(
          `Double Collision Alert: Teacher ${formData.teacherName} and classroom "${formData.room}" are both already booked during ${formData.dayOfWeek} Period ${formData.periodIndex}. Please select an alternate teacher, classroom, or time slot.`
        );
      } else if (validationStatus.teacherConflict) {
        const c = validationStatus.teacherConflict;
        setConflictError(
          `Teacher Booking Conflict: ${formData.teacherName} is already booked teaching ${c.grade} (${c.subject}) in ${c.room} on ${formData.dayOfWeek} Period ${formData.periodIndex} (${c.startTime || '08:00'} - ${c.endTime || '08:45'}).`
        );
      } else if (validationStatus.roomConflict) {
        const c = validationStatus.roomConflict;
        setConflictError(
          `Classroom Booking Conflict: Classroom "${formData.room}" is already reserved by ${c.teacherName} for ${c.grade} (${c.subject}) on ${formData.dayOfWeek} Period ${formData.periodIndex}.`
        );
      } else if (validationStatus.gradeConflict) {
        const c = validationStatus.gradeConflict;
        setConflictError(
          `Class Schedule Collision: ${formData.grade} is already scheduled for ${c.subject} with ${c.teacherName} in ${c.room} on ${formData.dayOfWeek} Period ${formData.periodIndex}.`
        );
      }
      return;
    }

    try {
      setIsSubmitting(true);
      const slotData: Partial<TimetableSlot> = {
        dayOfWeek: formData.dayOfWeek,
        periodIndex: Number(formData.periodIndex),
        periodName: `Period ${formData.periodIndex}`,
        startTime: periodSlots.find((p) => p.index === Number(formData.periodIndex))?.time.split(' - ')[0] || '08:00',
        endTime: periodSlots.find((p) => p.index === Number(formData.periodIndex))?.time.split(' - ')[1] || '08:45',
        grade: formData.grade,
        subject: formData.subject,
        teacherId: formData.teacherId || TEACHER_MAP[formData.teacherName] || 'user_teacher_1',
        teacherName: formData.teacherName,
        room: formData.room
      };

      await onAddSlot(slotData);
      setShowAddModal(false);
    } catch (err: any) {
      setConflictError(err.message || 'Failed to schedule timetable slot due to a booking collision.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-bold text-slate-900 font-serif">
              Master School Timetable & Class Schedules
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Weekly lesson matrices, classroom allocations, teacher period assignments, and conflict avoidance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Calendar vs Matrix Layout Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              id="timetable-layout-monthly-btn"
              type="button"
              onClick={() => setLayoutMode('monthly')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                layoutMode === 'monthly'
                  ? 'bg-orange-500 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Monthly Calendar</span>
            </button>
            <button
              id="timetable-layout-weekly-btn"
              type="button"
              onClick={() => setLayoutMode('weekly')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                layoutMode === 'weekly'
                  ? 'bg-orange-500 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table2 className="w-3.5 h-3.5" />
              <span>Weekly Matrix</span>
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          {userRole === 'admin' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/15 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Lesson</span>
            </button>
          )}
        </div>
      </div>

      {/* View Switcher & Selector */}
      <div
        id="timetable-controls"
        className="timetable-controls bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap gap-4 items-center justify-between"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-500">View By:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
              <button
                id="timetable-view-class-btn"
                type="button"
                onClick={() => setViewMode('class')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'class' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Class / Grade View
              </button>
              <button
                id="timetable-view-teacher-btn"
                type="button"
                onClick={() => {
                  setViewMode('teacher');
                  if (selectedTeacherFilter !== 'all') {
                    setSelectedTeacher(selectedTeacherFilter);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'teacher' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Teacher Schedule View
              </button>
            </div>
          </div>

          {viewMode === 'class' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Select Class:</span>
              <select
                id="timetable-grade-select"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer text-slate-800"
              >
                {availableGrades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Teacher Filter Dropdown & View Toggle Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label
              htmlFor="timetable-teacher-filter"
              className="text-xs font-bold text-slate-600 flex items-center gap-1.5 whitespace-nowrap"
            >
              <Filter className="w-3.5 h-3.5 text-orange-500" />
              <span>Filter by Teacher:</span>
            </label>
            <select
              id="timetable-teacher-filter"
              value={selectedTeacherFilter}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedTeacherFilter(val);
                if (val !== 'all') {
                  setSelectedTeacher(val);
                }
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-800 cursor-pointer"
            >
              <option value="all">All Teachers (Show All)</option>
              {availableTeachers.map((teacher) => (
                <option key={teacher} value={teacher}>
                  Only show {teacher}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Toggle View & Clear Actions */}
          {selectedTeacherFilter !== 'all' && (
            <div className="flex items-center gap-1.5">
              <button
                id="timetable-toggle-teacher-view-btn"
                type="button"
                onClick={() => {
                  if (viewMode === 'class') {
                    setViewMode('teacher');
                    setSelectedTeacher(selectedTeacherFilter);
                  } else {
                    setViewMode('class');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 transition-colors cursor-pointer"
                title="Toggle view between class schedule and full teacher schedule"
              >
                <User className="w-3.5 h-3.5 text-orange-600" />
                <span>
                  {viewMode === 'teacher' ? 'View in Class Grid' : `View ${selectedTeacherFilter}'s Full Schedule`}
                </span>
              </button>

              <button
                id="timetable-clear-teacher-filter-btn"
                type="button"
                onClick={() => setSelectedTeacherFilter('all')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Clear teacher filter and show all"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Filter Notification Banner */}
      {selectedTeacherFilter !== 'all' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-950 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 animate-pulse" />
            <span>
              Teacher Filter Active: Only displaying slots associated with{' '}
              <strong className="font-bold text-orange-900">{selectedTeacherFilter}</strong>
              {viewMode === 'class' ? (
                <> in <strong>{selectedGrade}</strong> ({filteredSlots.length} periods found)</>
              ) : (
                <> across all classes ({filteredSlots.length} weekly periods scheduled)</>
              )}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (viewMode === 'class') {
                  setViewMode('teacher');
                  setSelectedTeacher(selectedTeacherFilter);
                } else {
                  setViewMode('class');
                }
              }}
              className="text-orange-800 hover:text-orange-950 font-bold underline cursor-pointer text-xs"
            >
              {viewMode === 'class' ? 'Toggle to Full School Schedule' : `Toggle to ${selectedGrade} Only`}
            </button>
            <button
              type="button"
              onClick={() => setSelectedTeacherFilter('all')}
              className="text-slate-600 hover:text-slate-900 font-bold cursor-pointer text-xs"
            >
              Reset Filter
            </button>
          </div>
        </div>
      )}

      {/* Conditional Layout: Monthly Calendar or Weekly Grid */}
      {layoutMode === 'monthly' ? (
        <TimetableCalendarView
          slots={slots}
          viewMode={viewMode}
          selectedGrade={selectedGrade}
          selectedTeacher={selectedTeacher}
          selectedTeacherFilter={selectedTeacherFilter}
          onAddSlot={onAddSlot}
          onDeleteSlot={onDeleteSlot}
          onOpenAddModalWithDay={(day, periodIndex) => {
            setFormData((prev) => ({
              ...prev,
              dayOfWeek: day,
              periodIndex: periodIndex || prev.periodIndex,
              grade: selectedGrade
            }));
            setShowAddModal(true);
          }}
          userRole={userRole}
        />
      ) : (
        /* Weekly Grid */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold text-center">
                  <th className="p-3 w-28 md:w-32 lg:w-[12.5%] text-left border-r border-slate-800 shrink-0">Time / Period</th>
                  {days.map((day) => (
                    <th key={day} className="p-3 border-r border-slate-800 last:border-r-0 min-w-[140px] md:min-w-[150px] lg:min-w-0 lg:w-[17.5%]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {periodSlots.map((period, pIdx) => {
                  if (period.isBreak) {
                    return (
                      <tr key={pIdx} className="bg-amber-50/70 text-center font-bold text-amber-900">
                        <td className="p-2.5 text-xs text-slate-500 border-r border-slate-200 font-mono">
                          {period.time}
                        </td>
                        <td colSpan={5} className="p-2.5 text-xs uppercase tracking-widest text-amber-800">
                          ☕ {period.name}
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={pIdx} className="hover:bg-slate-50/50">
                      <td className="p-3 text-xs border-r border-slate-200 font-medium bg-slate-50/80">
                        <div className="font-bold text-slate-900">{period.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{period.time}</div>
                      </td>

                      {days.map((day) => {
                        const match = filteredSlots.find(
                          (s) => s.dayOfWeek === day && s.periodIndex === period.index
                        );

                        return (
                          <td key={day} className="p-2 border-r border-slate-200 last:border-r-0 align-top">
                            {match ? (
                              <div className="p-2.5 rounded-xl bg-indigo-50/90 border border-indigo-100 flex flex-col justify-between h-full group hover:border-indigo-300 transition-colors">
                                <div>
                                  <div className="text-xs font-black text-indigo-950">
                                    {match.subject}
                                  </div>
                                  <div className="text-[11px] text-indigo-700 font-medium flex items-center gap-1 mt-0.5">
                                    <User className="w-3 h-3 text-indigo-500 shrink-0" />
                                    <span className="truncate">
                                      {viewMode === 'class' ? match.teacherName : match.grade}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="truncate">{match.room}</span>
                                  </div>
                                </div>

                                {userRole === 'admin' && (
                                  <div className="pt-2 mt-2 border-t border-indigo-200/50 flex justify-end">
                                    <button
                                      onClick={() => onDeleteSlot(match.id)}
                                      className="p-1 rounded text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                                      title="Remove this scheduled lesson"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="h-16 flex items-center justify-center text-[11px] text-slate-300 border border-dashed border-slate-200 rounded-xl">
                                Free
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Lesson Modal with Proactive Collision Detection */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
                  <span>Schedule Lesson Slot</span>
                  {validationStatus.hasConflict ? (
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                      Conflict Detected
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Slot Available
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assigns a subject, teacher, and room to a weekly period with automatic booking validation.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setConflictError('');
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top Server or Submission Conflict Banner */}
            {conflictError && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold block text-rose-950 mb-0.5">Booking Alert</span>
                  {conflictError}
                </div>
              </div>
            )}

            {/* Proactive Real-Time Conflict Warning Card */}
            {validationStatus.hasConflict ? (
              <div className="mt-4 p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-950 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-xl bg-rose-200 text-rose-800 shrink-0 mt-0.5">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-rose-950 flex items-center gap-1.5">
                      Scheduling Conflict Detected
                    </span>

                    {validationStatus.teacherConflict && (
                      <p className="text-[11px] text-rose-800 leading-relaxed">
                        <strong className="font-semibold text-rose-950">Teacher Already Booked: </strong>
                        {formData.teacherName} is already assigned to teach{' '}
                        <span className="font-semibold">{validationStatus.teacherConflict.grade}</span> (
                        {validationStatus.teacherConflict.subject}) in{' '}
                        <span className="font-semibold">{validationStatus.teacherConflict.room}</span> on{' '}
                        {formData.dayOfWeek} Period {formData.periodIndex}.
                      </p>
                    )}

                    {validationStatus.roomConflict && (
                      <p className="text-[11px] text-rose-800 leading-relaxed">
                        <strong className="font-semibold text-rose-950">Classroom Already Occupied: </strong>
                        "{formData.room}" is already reserved by{' '}
                        <span className="font-semibold">{validationStatus.roomConflict.teacherName}</span> for{' '}
                        {validationStatus.roomConflict.grade} ({validationStatus.roomConflict.subject}) during this period.
                      </p>
                    )}

                    {validationStatus.gradeConflict && (
                      <p className="text-[11px] text-rose-800 leading-relaxed">
                        <strong className="font-semibold text-rose-950">Class Schedule Collision: </strong>
                        {formData.grade} already has{' '}
                        <span className="font-semibold">{validationStatus.gradeConflict.subject}</span> with{' '}
                        {validationStatus.gradeConflict.teacherName} in{' '}
                        {validationStatus.gradeConflict.room}.
                      </p>
                    )}
                  </div>
                </div>

                {/* Instant Quick-Fix Recommendation Actions */}
                <div className="pt-2 border-t border-rose-200/80 space-y-2">
                  {validationStatus.roomConflict && validationStatus.availableRooms.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-rose-900 block mb-1">
                        Alternative Unreserved Rooms for Period {formData.periodIndex}:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {validationStatus.availableRooms.slice(0, 4).map((rm) => (
                          <button
                            key={rm}
                            type="button"
                            onClick={() => setFormData({ ...formData, room: rm })}
                            className="px-2 py-0.5 rounded-lg bg-white hover:bg-rose-100 border border-rose-300 text-[10px] font-semibold text-rose-900 transition-colors cursor-pointer shadow-xs"
                          >
                            Switch to {rm}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {validationStatus.teacherConflict && validationStatus.teacherFreePeriods.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-rose-900 block mb-1">
                        Free Periods for {formData.teacherName} on {formData.dayOfWeek}:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {validationStatus.teacherFreePeriods.slice(0, 3).map((p) => (
                          <button
                            key={p.index}
                            type="button"
                            onClick={() => setFormData({ ...formData, periodIndex: p.index })}
                            className="px-2 py-0.5 rounded-lg bg-white hover:bg-rose-100 border border-rose-300 text-[10px] font-semibold text-rose-900 transition-colors cursor-pointer shadow-xs"
                          >
                            Move to {p.name} ({p.time})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-[11px]">
                    No Booking Collisions: Teacher and Classroom are both unreserved.
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                  Ready to Book
                </span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Day of Week</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => {
                      setFormData({ ...formData, dayOfWeek: e.target.value as any });
                      setConflictError('');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Period Slot</label>
                  <select
                    value={formData.periodIndex}
                    onChange={(e) => {
                      setFormData({ ...formData, periodIndex: Number(e.target.value) });
                      setConflictError('');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    <option value={1}>Period 1 (08:00 - 08:45)</option>
                    <option value={2}>Period 2 (08:45 - 09:30)</option>
                    <option value={3}>Period 3 (09:50 - 10:35)</option>
                    <option value={4}>Period 4 (10:35 - 11:20)</option>
                    <option value={5}>Period 5 (11:40 - 12:25)</option>
                    <option value={6}>Period 6 (13:30 - 14:15)</option>
                    <option value={7}>Period 7 (14:15 - 15:00)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-600 font-medium">Class / Grade</label>
                    {validationStatus.gradeConflict ? (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                        Collision
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400">
                        Available
                      </span>
                    )}
                  </div>
                  <select
                    value={formData.grade}
                    onChange={(e) => {
                      setFormData({ ...formData, grade: e.target.value });
                      setConflictError('');
                    }}
                    className={`w-full px-3 py-2 rounded-xl border bg-white font-semibold transition-colors ${
                      validationStatus.gradeConflict
                        ? 'border-rose-300 bg-rose-50/30'
                        : 'border-slate-300'
                    }`}
                  >
                    {availableGrades.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Mathematics"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-600 font-medium">Teacher</label>
                    {validationStatus.teacherConflict ? (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" /> Booked
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Free
                      </span>
                    )}
                  </div>
                  <select
                    value={formData.teacherName}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({
                        ...formData,
                        teacherName: name,
                        teacherId: TEACHER_MAP[name] || 'user_teacher_1'
                      });
                      setConflictError('');
                    }}
                    className={`w-full px-3 py-2 rounded-xl border bg-white font-medium transition-colors ${
                      validationStatus.teacherConflict
                        ? 'border-rose-400 bg-rose-50/40 text-rose-950 ring-1 ring-rose-400'
                        : 'border-slate-300'
                    }`}
                  >
                    {availableTeachers.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-600 font-medium">Room / Lab</label>
                    {validationStatus.roomConflict ? (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" /> Occupied
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Free
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    list="standard-rooms-list"
                    value={formData.room}
                    onChange={(e) => {
                      setFormData({ ...formData, room: e.target.value });
                      setConflictError('');
                    }}
                    placeholder="e.g. Room 204 or Physics Lab"
                    className={`w-full px-3 py-2 rounded-xl border bg-white transition-colors ${
                      validationStatus.roomConflict
                        ? 'border-rose-400 bg-rose-50/40 text-rose-950 ring-1 ring-rose-400 font-semibold'
                        : 'border-slate-300'
                    }`}
                  />
                  <datalist id="standard-rooms-list">
                    {standardRooms.map((rm) => (
                      <option key={rm} value={rm} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Quick Facility Suggestion Chips */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span>Quick Select Room</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Click to auto-populate
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {standardRooms.slice(0, 6).map((r) => {
                    const isOccupied = slots.some(
                      (s) =>
                        s.dayOfWeek === formData.dayOfWeek &&
                        s.periodIndex === Number(formData.periodIndex) &&
                        s.room.toLowerCase().trim() === r.toLowerCase().trim()
                    );
                    const isSelected = formData.room.toLowerCase().trim() === r.toLowerCase().trim();

                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, room: r });
                          setConflictError('');
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-orange-500 text-white border-orange-500'
                            : isOccupied
                            ? 'bg-rose-50/80 text-rose-700 border-rose-200 line-through opacity-60'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                        title={isOccupied ? `Occupied during Period ${formData.periodIndex}` : `Available`}
                      >
                        {r.replace(' (Science Wing)', '')}
                        {isOccupied && ' (Booked)'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setConflictError('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || validationStatus.hasConflict}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                    validationStatus.hasConflict
                      ? 'bg-rose-100 text-rose-700 border border-rose-300 cursor-not-allowed opacity-90'
                      : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 cursor-pointer'
                  }`}
                  title={
                    validationStatus.hasConflict
                      ? 'Resolve teacher or room conflict before saving'
                      : 'Save lesson slot'
                  }
                >
                  {validationStatus.hasConflict ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Collision Detected — Resolve to Schedule</span>
                    </>
                  ) : isSubmitting ? (
                    <span>Validating Slot...</span>
                  ) : (
                    <span>Confirm & Schedule Lesson</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
