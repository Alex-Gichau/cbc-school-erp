import React, { useState } from 'react';
import {
  CheckCircle2,
  Calendar,
  UserCheck,
  AlertCircle,
  Save,
  Sparkles,
  Users,
  Clock,
  HelpCircle
} from 'lucide-react';
import { Student, AttendanceStatus, UserRole } from '../types';

interface AttendanceTrackerProps {
  students: Student[];
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
  onRecordAttendance,
  userRole,
  currentUserName
}) => {
  const [selectedGrade, setSelectedGrade] = useState('Grade 10-A');
  const [selectedDate, setSelectedDate] = useState('2026-03-16');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Filter students for the grade
  const classStudents = students.filter(
    (s) => s.grade.toLowerCase() === selectedGrade.toLowerCase()
  );

  // Roll call states
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: AttendanceStatus; reason: string }>
  >({});

  // Initialize roll call map
  React.useEffect(() => {
    const initial: Record<string, { status: AttendanceStatus; reason: string }> = {};
    classStudents.forEach((s) => {
      // Default Ethan and Chloe to present, Brian to absent if not marked
      initial[s.id] = {
        status: s.admissionNumber === 'ADM-2024-0104' ? 'absent' : 'present',
        reason: s.admissionNumber === 'ADM-2024-0104' ? 'Reported illness' : ''
      };
    });
    setAttendanceMap(initial);
  }, [selectedGrade]);

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

  // Counts
  const total = classStudents.length;
  const presentCount = classStudents.filter((s) => attendanceMap[s.id]?.status === 'present').length;
  const absentCount = classStudents.filter((s) => attendanceMap[s.id]?.status === 'absent').length;
  const lateCount = classStudents.filter((s) => attendanceMap[s.id]?.status === 'late').length;
  const excusedCount = classStudents.filter((s) => attendanceMap[s.id]?.status === 'excused').length;
  const rate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-bold text-slate-900 font-serif">
              Daily Class Roll Call & Attendance Register
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Account for every learner daily. Updates automatically reflect on the headmaster's analytics dashboard.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllPresent}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            Mark All Present
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Submit Attendance'}</span>
          </button>
        </div>
      </div>

      {submitSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Attendance registered successfully and synchronized with school-wide trends!</span>
        </div>
      )}

      {/* Control Bar & Class Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Class
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
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
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
            >
            </input>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          <div className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
            {presentCount} Present
          </div>
          <div className="px-3 py-1 rounded-lg bg-rose-50 text-rose-800 font-bold border border-rose-200">
            {absentCount} Absent
          </div>
          <div className="px-3 py-1 rounded-lg bg-amber-50 text-amber-800 font-bold border border-amber-200">
            {lateCount} Late
          </div>
          <div className="px-3 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold border border-blue-200">
            {excusedCount} Excused
          </div>
          <div className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 font-black">
            Rate: {rate}%
          </div>
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
                <th className="py-3 px-4">Reason / Notes (If Absent or Late)</th>
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
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            item.status === 'present'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleStatusChange(s.id, 'absent')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            item.status === 'absent'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => handleStatusChange(s.id, 'late')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            item.status === 'late'
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          Late
                        </button>
                        <button
                          onClick={() => handleStatusChange(s.id, 'excused')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            item.status === 'excused'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          Excused
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <input
                        type="text"
                        value={item.reason}
                        onChange={(e) => handleReasonChange(s.id, e.target.value)}
                        placeholder="e.g. Sick bay, dental check, family leave..."
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
  );
};
