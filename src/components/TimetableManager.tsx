import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Plus,
  Printer,
  Trash2,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle,
  X,
  Filter
} from 'lucide-react';
import { TimetableSlot, UserRole } from '../types';

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

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError('');

    // Check conflict locally before sending
    const conflict = slots.find(
      (s) =>
        s.dayOfWeek === formData.dayOfWeek &&
        s.periodIndex === Number(formData.periodIndex) &&
        (s.teacherName === formData.teacherName || s.room.toLowerCase() === formData.room.toLowerCase())
    );

    if (conflict) {
      if (conflict.teacherName === formData.teacherName) {
        setConflictError(
          `Teacher Conflict: ${formData.teacherName} is already scheduled for ${conflict.grade} in ${conflict.room} during ${formData.dayOfWeek} Period ${formData.periodIndex}.`
        );
      } else {
        setConflictError(
          `Room Conflict: ${formData.room} is already booked for ${conflict.subject} (${conflict.grade}) during this period.`
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
        teacherId: formData.teacherId,
        teacherName: formData.teacherName,
        room: formData.room
      };

      await onAddSlot(slotData);
      setShowAddModal(false);
    } catch (err: any) {
      setConflictError(err.message || 'Failed to save timetable slot');
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

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Timetable</span>
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

      {/* Weekly Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold text-center">
                <th className="p-3 w-28 text-left border-r border-slate-800">Time / Period</th>
                {days.map((day) => (
                  <th key={day} className="p-3 border-r border-slate-800 last:border-r-0 min-w-[170px]">
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

      {/* Schedule Lesson Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-serif">
                  Schedule Lesson Slot
                </h2>
                <p className="text-xs text-slate-500">
                  Assigns a subject, teacher, and room to a weekly period with automatic conflict checking.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {conflictError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{conflictError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Day of Week</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Period Slot</label>
                  <select
                    value={formData.periodIndex}
                    onChange={(e) => setFormData({ ...formData, periodIndex: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
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
                  <label className="block text-slate-600 mb-1">Class / Grade</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                  >
                    <option value="Grade 10-A">Grade 10-A</option>
                    <option value="Grade 11-A">Grade 11-A</option>
                    <option value="Grade 9-A">Grade 9-A</option>
                    <option value="Grade 12-A">Grade 12-A</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Mathematics"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Teacher</label>
                  <select
                    value={formData.teacherName}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({
                        ...formData,
                        teacherName: name,
                        teacherId: name.includes('Sarah') ? 'user_teacher_1' : 'user_teacher_2'
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    <option value="Sarah Jenkins">Sarah Jenkins</option>
                    <option value="Marcus Vance">Marcus Vance</option>
                    <option value="Dr. Helen Oloo">Dr. Helen Oloo</option>
                    <option value="Claire Kamau">Claire Kamau</option>
                    <option value="Antony Barasa">Antony Barasa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Room / Lab</label>
                  <input
                    type="text"
                    required
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="e.g. Room 204 or Physics Lab"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Checking...' : 'Confirm & Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
