import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Calendar,
  CalendarCheck,
  UserCheck,
  AlertCircle,
  Save,
  Clock,
  Search,
  Printer,
  Download,
  FileSpreadsheet,
  RotateCcw,
  History,
  ClipboardList,
  Filter,
  Users
} from 'lucide-react';
import { Student, AttendanceStatus, AttendanceRecord, UserRole, AttendanceAnalytics } from '../types';
import { DateRangeFilter } from './DateRangeFilter';

interface AttendanceTrackerProps {
  students: Student[];
  attendanceRecords?: AttendanceRecord[];
  analytics?: AttendanceAnalytics;
  onRecordAttendance: (data: {
    date: string;
    grade: string;
    records: { studentId: string; studentName: string; admissionNumber: string; status: AttendanceStatus; reason?: string }[];
    recordedBy: string;
  }) => Promise<void>;
  userRole: UserRole;
  currentUserName: string;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  students,
  attendanceRecords = [],
  analytics,
  onRecordAttendance,
  userRole,
  currentUserName
}) => {
  // Top view toggle: 'rollcall' vs 'historical'
  const [activeView, setActiveView] = useState<'rollcall' | 'historical'>('rollcall');

  // Roll Call state
  const [selectedGrade, setSelectedGrade] = useState('Grade 10-A');
  const [selectedDate, setSelectedDate] = useState('2026-03-16');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Historical Logs Filter state
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | AttendanceStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Class students for roll call
  const classStudents = students.filter(
    (s) => s.grade.toLowerCase() === selectedGrade.toLowerCase()
  );

  // Roll call map state
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: AttendanceStatus; reason: string }>
  >({});

  // Initialize roll call map when class or date changes
  React.useEffect(() => {
    const initial: Record<string, { status: AttendanceStatus; reason: string }> = {};

    // Check if there are already records for this grade and date in attendanceRecords
    const existingForDate = attendanceRecords.filter(
      (r) => r.date === selectedDate && r.grade.toLowerCase() === selectedGrade.toLowerCase()
    );

    classStudents.forEach((s) => {
      const match = existingForDate.find((r) => r.studentId === s.id);
      if (match) {
        initial[s.id] = {
          status: match.status,
          reason: match.reason || ''
        };
      } else {
        // Default Brian to absent if not marked
        initial[s.id] = {
          status: s.admissionNumber === 'ADM-2024-0104' ? 'absent' : 'present',
          reason: s.admissionNumber === 'ADM-2024-0104' ? 'Reported illness' : ''
        };
      }
    });
    setAttendanceMap(initial);
  }, [selectedGrade, selectedDate, attendanceRecords.length]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
    setSubmitSuccess(false);
  };

  const handleReasonChange = (studentId: string, reason: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        reason
      }
    }));
    setSubmitSuccess(false);
  };

  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; reason: string }> = {};
    classStudents.forEach((s) => {
      updated[s.id] = { status: 'present', reason: '' };
    });
    setAttendanceMap(updated);
    setSubmitSuccess(false);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const records = classStudents.map((s) => {
        const item = attendanceMap[s.id] || { status: 'present', reason: '' };
        return {
          studentId: s.id,
          studentName: `${s.firstName} ${s.lastName}`,
          admissionNumber: s.admissionNumber,
          status: item.status,
          reason: item.reason
        };
      });

      await onRecordAttendance({
        date: selectedDate,
        grade: selectedGrade,
        records,
        recordedBy: currentUserName
      });

      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Roll call counters
  const totalRollCall = classStudents.length;
  const rollCallPresent = classStudents.filter((s) => attendanceMap[s.id]?.status === 'present').length;
  const rollCallExcused = classStudents.filter((s) => attendanceMap[s.id]?.status === 'excused').length;
  const rollCallAbsent = classStudents.filter((s) => attendanceMap[s.id]?.status === 'absent').length;
  const rollCallRate = totalRollCall > 0 ? Math.round((rollCallPresent / totalRollCall) * 100) : 100;

  // School-wide analytics and today's summary metrics
  const totalSchoolEnrollment = analytics?.totalStudents || students.length || 340;

  // Track initial class roll call state for real-time delta reactivity
  const initialClassState = useMemo(() => {
    const existingForDate = attendanceRecords.filter(
      (r) => r.date === selectedDate && r.grade.toLowerCase() === selectedGrade.toLowerCase()
    );
    let initP = 0, initA = 0, initE = 0;
    classStudents.forEach((s) => {
      const match = existingForDate.find((r) => r.studentId === s.id);
      const st = match ? match.status : (s.admissionNumber === 'ADM-2024-0104' ? 'absent' : 'present');
      if (st === 'present') initP++;
      else if (st === 'absent') initA++;
      else if (st === 'excused') initE++;
    });
    return { initP, initA, initE };
  }, [selectedGrade, selectedDate, attendanceRecords, classStudents]);

  // Base counts from analytics
  const basePresent = analytics?.presentToday ?? 322;
  const baseAbsent = analytics?.absentToday ?? 18;
  const baseExcused = analytics?.excusedToday ?? 6;

  // Live adjusted counts for today reflecting any active roll-call adjustments
  const todayPresent = Math.max(0, basePresent + (rollCallPresent - initialClassState.initP));
  const todayAbsent = Math.max(0, baseAbsent + (rollCallAbsent - initialClassState.initA));
  const todayExcused = Math.max(0, baseExcused + (rollCallExcused - initialClassState.initE));

  const todayRate = totalSchoolEnrollment > 0
    ? Math.round((todayPresent / totalSchoolEnrollment) * 1000) / 10
    : 94.7;
  const todayAbsentRate = totalSchoolEnrollment > 0
    ? Math.round((todayAbsent / totalSchoolEnrollment) * 1000) / 10
    : 5.3;

  // -------------------------------------------------------------
  // Historical Records Filtering Logic
  // -------------------------------------------------------------
  const filteredHistoricalRecords = useMemo(() => {
    return attendanceRecords.filter((rec) => {
      // Date range filter
      if (filterStartDate && rec.date < filterStartDate) return false;
      if (filterEndDate && rec.date > filterEndDate) return false;

      // Grade filter
      if (filterGrade !== 'all' && rec.grade.toLowerCase() !== filterGrade.toLowerCase()) {
        return false;
      }

      // Status filter
      if (filterStatus !== 'all' && rec.status.toLowerCase() !== filterStatus.toLowerCase()) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = rec.studentName.toLowerCase().includes(q);
        const matchesAdm = rec.admissionNumber.toLowerCase().includes(q);
        const matchesReason = (rec.reason || '').toLowerCase().includes(q);
        const matchesRecorder = (rec.recordedBy || '').toLowerCase().includes(q);
        if (!matchesName && !matchesAdm && !matchesReason && !matchesRecorder) {
          return false;
        }
      }

      return true;
    });
  }, [attendanceRecords, filterStartDate, filterEndDate, filterGrade, filterStatus, searchQuery]);

  // Historical Analytics within Selected Date Range
  const histTotal = filteredHistoricalRecords.length;
  const histPresent = filteredHistoricalRecords.filter((r) => r.status === 'present').length;
  const histExcused = filteredHistoricalRecords.filter((r) => r.status === 'excused').length;
  const histAbsent = filteredHistoricalRecords.filter((r) => r.status === 'absent').length;
  const histRate = histTotal > 0 ? Math.round((histPresent / histTotal) * 100) : 0;

  // CSV Export for filtered historical records
  const handleExportCSV = () => {
    const headers = ['Date', 'Admission No', 'Student Name', 'Grade', 'Status', 'Reason / Notes', 'Recorded By'];
    const rows = filteredHistoricalRecords.map((r) => [
      r.date,
      r.admissionNumber,
      `"${r.studentName}"`,
      r.grade,
      r.status.toUpperCase(),
      `"${r.reason || ''}"`,
      `"${r.recordedBy || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_logs_${filterStartDate || 'all'}_to_${filterEndDate || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResetHistoricalFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterGrade('all');
    setFilterStatus('all');
    setSearchQuery('');
  };

  const formatDateWithDay = (dateStr: string): { day: string; formatted: string } => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { day: '', formatted: dateStr };
      const day = d.toLocaleDateString('en-GB', { weekday: 'short' });
      const formatted = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      return { day, formatted };
    } catch {
      return { day: '', formatted: dateStr };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-bold text-slate-900 font-serif">
              Learner Attendance & Daily Register
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Conduct daily class roll call or audit multi-week historical attendance logs across academic terms.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveView('rollcall')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'rollcall'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5 text-orange-500" />
            <span>Daily Roll Call Register</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('historical')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'historical'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5 text-orange-500" />
            <span>Historical Attendance Logs</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
              {attendanceRecords.length}
            </span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards: Immediate Context Before Listing Individual Records */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Today's Total Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-emerald-200 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Today's Total Attendance
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2.5 mt-2.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {todayPresent}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                todayRate >= 95
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                  : 'bg-orange-50 text-orange-700 border-orange-200/60'
              }`}>
                {todayRate}% Presence
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1">
              {todayPresent} of {totalSchoolEnrollment} learners present across campus
            </p>

            {/* Visual mini progress track */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  todayRate >= 95 ? 'bg-emerald-500' : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min(100, todayRate)}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${todayRate >= 95 ? 'bg-emerald-500' : 'bg-orange-500'}`} />
              <span className="text-slate-600 font-medium">
                Target: <strong className="text-slate-900">95.0%</strong>
              </span>
            </div>
            <span className="text-slate-500 font-medium truncate max-w-[170px]" title={`${selectedGrade}: ${rollCallPresent}/${totalRollCall} present`}>
              {selectedGrade}: <strong className="text-emerald-700 font-bold">{rollCallPresent}/{totalRollCall}</strong>
            </span>
          </div>
        </div>

        {/* Card 2: Students Absent */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-rose-200 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Students Absent
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-100/80 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2.5 mt-2.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {todayAbsent}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60">
                {todayAbsentRate}% of Roll
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1">
              Unexcused absences & illness reports logged today
            </p>

            {/* Visual mini progress track */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-rose-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(3, todayAbsentRate * 3))}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="text-rose-700 font-semibold">
                {todayAbsent > 0 ? 'Follow-up flagged' : 'Zero absences'}
              </span>
            </div>
            <span className="text-slate-500 font-medium truncate max-w-[170px]" title={`${selectedGrade}: ${rollCallAbsent} absent`}>
              {selectedGrade}: <strong className="text-rose-700 font-bold">{rollCallAbsent} absent</strong>
            </span>
          </div>
        </div>

        {/* Card 3: Excused Leaves */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-blue-200 transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Excused Leaves
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/80 flex items-center justify-center shrink-0">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2.5 mt-2.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {todayExcused}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                Documented
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1">
              Authorized medical appointments & approved family leaves
            </p>

            {/* Visual mini progress track */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(3, (todayExcused / (totalSchoolEnrollment || 340)) * 200))}%` }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="text-blue-700 font-semibold">
                Parent notes verified
              </span>
            </div>
            <span className="text-slate-500 font-medium truncate max-w-[170px]" title={`${selectedGrade}: ${rollCallExcused} excused`}>
              {selectedGrade}: <strong className="text-blue-700 font-bold">{rollCallExcused} excused</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: DAILY ROLL CALL REGISTER                          */}
      {/* ========================================================= */}
      {activeView === 'rollcall' && (
        <div className="space-y-6 animate-in fade-in">
          {submitSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Attendance registered successfully for {selectedGrade} on {selectedDate}!</span>
              </div>
              <button
                onClick={() => {
                  setFilterStartDate(selectedDate);
                  setFilterEndDate(selectedDate);
                  setFilterGrade(selectedGrade);
                  setActiveView('historical');
                }}
                className="text-[11px] font-bold text-emerald-900 underline hover:no-underline cursor-pointer"
              >
                View in Historical Logs →
              </button>
            </div>
          )}

          {/* Control Bar & Class Selector */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Class / Grade
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-orange-500"
                >
                  <option value="Grade 9-A">Grade 9-A</option>
                  <option value="Grade 9-B">Grade 9-B</option>
                  <option value="Grade 10-A">Grade 10-A</option>
                  <option value="Grade 10-B">Grade 10-B</option>
                  <option value="Grade 11-A">Grade 11-A</option>
                  <option value="Grade 12-A">Grade 12-A</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Roll Call Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="self-end pb-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setFilterGrade(selectedGrade);
                    setFilterStartDate('');
                    setFilterEndDate('');
                    setActiveView('historical');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer border border-slate-200/70"
                  title="Switch to Historical Logs view with date range filter"
                >
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>Audit History Range</span>
                </button>
              </div>
            </div>

            {/* Live Counters */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                {rollCallPresent} Present
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold border border-blue-200">
                {rollCallExcused} Excused
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 font-bold border border-rose-200">
                {rollCallAbsent} Absent
              </div>
              <div className="px-3 py-1 rounded-lg bg-slate-900 text-white font-black">
                Rate: {rollCallRate}%
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkAllPresent}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Mark All Present
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Submit Register'}</span>
              </button>
            </div>
          </div>

          {/* Student Roll Call Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-3 px-4 w-28 md:w-32">Adm No.</th>
                    <th className="py-3 px-4 md:w-44 lg:w-56">Learner Name</th>
                    <th className="py-3 px-4 text-center md:w-72 lg:w-80">Status Selection</th>
                    <th className="py-3 px-4">Reason / Notes (If Excused or Absent)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.map((s) => {
                    const item = attendanceMap[s.id] || { status: 'present', reason: '' };

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">
                          {s.admissionNumber}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {s.firstName} {s.lastName}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleStatusChange(s.id, 'present')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                item.status === 'present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => handleStatusChange(s.id, 'excused')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                item.status === 'excused'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                              }`}
                            >
                              Excused
                            </button>
                            <button
                              onClick={() => handleStatusChange(s.id, 'absent')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                item.status === 'absent'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <input
                            type="text"
                            value={item.reason}
                            onChange={(e) => handleReasonChange(s.id, e.target.value)}
                            placeholder="e.g. Sick bay, dental check, traffic delay, family leave..."
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none text-xs text-slate-800"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: HISTORICAL ATTENDANCE LOGS & REGISTER ARCHIVE     */}
      {/* ========================================================= */}
      {activeView === 'historical' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Reusable Date Range Picker Filter Component */}
          <DateRangeFilter
            startDate={filterStartDate}
            endDate={filterEndDate}
            onDateRangeChange={(start, end) => {
              setFilterStartDate(start);
              setFilterEndDate(end);
            }}
            label="Historical Attendance Time Frame Filter"
            helperText="Select a starting and ending date or click a preset time frame to query archived class roll call registers."
            matchedCount={filteredHistoricalRecords.length}
            totalCount={attendanceRecords.length}
            entityLabel="attendance logs"
          />

          {/* Secondary Filter Bar: Class, Status, Search, and Export/Print */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row gap-3 items-center justify-between">
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search learner, adm no, reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Class Filter */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                  Class:
                </label>
                <select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                >
                  <option value="all">All Classes</option>
                  <option value="Grade 9-A">Grade 9-A</option>
                  <option value="Grade 9-B">Grade 9-B</option>
                  <option value="Grade 10-A">Grade 10-A</option>
                  <option value="Grade 10-B">Grade 10-B</option>
                  <option value="Grade 11-A">Grade 11-A</option>
                  <option value="Grade 12-A">Grade 12-A</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                  Status:
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="present">Present Only</option>
                  <option value="excused">Excused Only</option>
                  <option value="absent">Absent Only</option>
                </select>
              </div>
            </div>

            {/* Quick Actions: Export CSV and Print */}
            <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                title="Export filtered records to spreadsheet CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                title="Print official attendance audit sheet"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print Register Sheet</span>
              </button>
            </div>
          </div>

          {/* Time Frame Analytics KPI Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Logs
              </span>
              <div className="text-xl font-black text-slate-900 mt-1">{histTotal}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">Learner sessions</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Overall Rate
              </span>
              <div className="text-xl font-black text-orange-600 mt-1">{histRate}%</div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all"
                  style={{ width: `${histRate}%` }}
                />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                Present
              </span>
              <div className="text-xl font-black text-emerald-700 mt-1">{histPresent}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {histTotal > 0 ? Math.round((histPresent / histTotal) * 100) : 0}% of period
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                Excused
              </span>
              <div className="text-xl font-black text-blue-700 mt-1">{histExcused}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {histTotal > 0 ? Math.round((histExcused / histTotal) * 100) : 0}% of period
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                Absent
              </span>
              <div className="text-xl font-black text-rose-700 mt-1">{histAbsent}</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {histTotal > 0 ? Math.round((histAbsent / histTotal) * 100) : 0}% of period
              </p>
            </div>
          </div>

          {/* Historical Logs Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {filteredHistoricalRecords.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  No attendance logs found in this time frame
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try widening your start or end date, selecting "All Records", or clearing the search keywords.
                </p>
                <button
                  type="button"
                  onClick={handleResetHistoricalFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs transition-colors cursor-pointer border border-orange-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="py-3 px-4 w-32">Date</th>
                      <th className="py-3 px-4 w-28">Adm No.</th>
                      <th className="py-3 px-4">Learner Name</th>
                      <th className="py-3 px-4 w-24">Class</th>
                      <th className="py-3 px-4 w-28">Status</th>
                      <th className="py-3 px-4">Reason / Excuse Notes</th>
                      <th className="py-3 px-4 w-36">Recorded By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredHistoricalRecords.map((r) => {
                      const { day, formatted } = formatDateWithDay(r.date);

                      return (
                        <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-semibold text-slate-700 whitespace-nowrap">
                            <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold mr-1.5">
                              {day}
                            </span>
                            <span>{formatted}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600 font-medium">
                            {r.admissionNumber}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {r.studentName}
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">
                            {r.grade}
                          </td>
                          <td className="py-3 px-4">
                            {r.status === 'present' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Present
                              </span>
                            )}
                            {r.status === 'excused' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                Excused
                              </span>
                            )}
                            {r.status === 'absent' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Absent
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                            {r.reason ? (
                              <span className="italic text-slate-700">"{r.reason}"</span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-medium">
                            {r.recordedBy || 'Class Teacher'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
