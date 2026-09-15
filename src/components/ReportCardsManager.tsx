import React, { useState } from 'react';
import {
  FileCheck2,
  Printer,
  Search,
  Award,
  Calendar,
  User,
  CheckCircle2,
  Download,
  BookOpen
} from 'lucide-react';
import { Student, GradeRecord, UserRole } from '../types';

interface ReportCardsManagerProps {
  students: Student[];
  grades: GradeRecord[];
  userRole: UserRole;
}

export const ReportCardsManager: React.FC<ReportCardsManagerProps> = ({
  students,
  grades,
  userRole
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [academicYear, setAcademicYear] = useState('2026');

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Subjects for the report card
  const subjectsList = [
    'Mathematics',
    'Physics',
    'English Literature',
    'Chemistry',
    'Biology',
    'History & Citizenship',
    'Geography',
    'Computer Studies'
  ];

  // Helper to get grade info
  const getSubjectMark = (subjectName: string) => {
    const match = grades.find(
      (g) =>
        g.studentId === selectedStudent?.id &&
        g.subject.toLowerCase() === subjectName.toLowerCase()
    );

    if (match) {
      return {
        ca: Math.round(match.score * 0.3),
        exam: Math.round(match.score * 0.7),
        total: match.score,
        grade: match.letterGrade,
        remarks: match.remarks || 'Commendable performance'
      };
    }

    // Default calculated mark based on student general standing
    const base = selectedStudent?.admissionNumber.includes('0101') ? 88 : 74;
    return {
      ca: 26,
      exam: base - 26,
      total: base,
      grade: base >= 80 ? 'A' : base >= 70 ? 'B' : 'C',
      remarks: 'Consistently engaged in lessons and tasks.'
    };
  };

  const subjectResults = subjectsList.map((subject) => ({
    name: subject,
    ...getSubjectMark(subject)
  }));

  const totalScore = subjectResults.reduce((acc, curr) => acc + curr.total, 0);
  const averageScore = (totalScore / subjectResults.length).toFixed(1);

  const handlePrint = () => {
    window.print();
  };

  if (!selectedStudent) {
    return (
      <div className="p-8 text-center text-slate-500">
        No students enrolled yet to generate terminal report cards.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-bold text-slate-900 font-serif">
              Terminal Learner Performance & Report Cards
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Formal, printable end-of-term academic statements with subject breakdown, teacher evaluations, and attendance tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/15 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report Card</span>
          </button>
        </div>
      </div>

      {/* Student Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap gap-4 items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Select Learner:</span>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName} ({s.admissionNumber} - {s.grade})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Term:</span>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50"
            >
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Year:</span>
            <span className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-800">
              {academicYear}
            </span>
          </div>
        </div>
      </div>

      {/* Printable Report Card Sheet */}
      <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-md max-w-4xl mx-auto space-y-6 text-slate-900 font-serif print:shadow-none print:border-none print:p-0">
        {/* School Header */}
        <div className="text-center pb-4 border-b-2 border-slate-900">
          <h1 className="text-2xl font-black uppercase tracking-widest text-slate-950">
            EDURA ACADEMY
          </h1>
          <p className="text-xs font-sans uppercase font-bold tracking-wider text-slate-600 mt-0.5">
            "Excellence in Character and Wisdom"
          </p>
          <p className="text-[11px] font-sans text-slate-500 mt-1">
            St. Theresa Campus • P.O. Box 40201-00100, Nairobi • Tel: +254 20 678 9000 • Email: registrar@edura.edu
          </p>
          <div className="inline-block mt-3 px-4 py-1 bg-slate-900 text-white font-sans text-xs font-bold uppercase tracking-widest rounded-full">
            Official Terminal Academic Report Card
          </div>
        </div>

        {/* Learner & Session Meta */}
        <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 font-sans text-xs grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Learner Name:</span>
            <span className="font-black text-slate-900 text-sm">
              {selectedStudent.firstName} {selectedStudent.lastName}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Admission Number:</span>
            <span className="font-mono font-bold text-slate-900">
              {selectedStudent.admissionNumber}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Class / Grade:</span>
            <span className="font-bold text-slate-900">{selectedStudent.grade}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Academic Session:</span>
            <span className="font-bold text-slate-900">
              {selectedTerm}, {academicYear}
            </span>
          </div>
        </div>

        {/* Attendance & Enrollment Standing */}
        <div className="flex flex-wrap items-center justify-between p-3 bg-slate-100/60 rounded-xl font-sans text-xs border border-slate-200/60">
          <div>
            <span className="text-slate-500">Days Present in Term: </span>
            <span className="font-bold text-slate-900">
              {Math.round(((selectedStudent.attendancePercentage ?? 95) / 100) * 60)} of 60 days
            </span>
          </div>
          <div>
            <span className="text-slate-500">Attendance Percentage: </span>
            <span className="font-black text-emerald-800">
              {selectedStudent.attendancePercentage ?? 95}%
            </span>
          </div>
          <div>
            <span className="text-slate-500">Fee Clearance: </span>
            <span
              className={`font-bold ${
                selectedStudent.feeBalance === 0 ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {selectedStudent.feeBalance === 0
                ? 'Full Clearance'
                : `Balance: KES ${selectedStudent.feeBalance.toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* Academic Matrix Table */}
        <div className="overflow-hidden border border-slate-300 rounded-xl">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3 text-center">CA (30%)</th>
                <th className="py-2.5 px-3 text-center">Exam (70%)</th>
                <th className="py-2.5 px-3 text-center">Total (100%)</th>
                <th className="py-2.5 px-3 text-center">Grade</th>
                <th className="py-2.5 px-3">Subject Teacher Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {subjectResults.map((sub, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{sub.name}</td>
                  <td className="py-2.5 px-3 text-center text-slate-600">{sub.ca}</td>
                  <td className="py-2.5 px-3 text-center text-slate-600">{sub.exam}</td>
                  <td className="py-2.5 px-3 text-center font-black text-slate-900">{sub.total}%</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block w-6 py-0.5 rounded text-[11px] font-black ${
                        sub.grade === 'A'
                          ? 'bg-emerald-100 text-emerald-900'
                          : sub.grade === 'B'
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-indigo-100 text-indigo-900'
                      }`}
                    >
                      {sub.grade}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-700 italic">{sub.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-3 gap-4 font-sans text-center">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Total Points
            </span>
            <div className="text-xl font-black text-slate-900">{totalScore} / 800</div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
            <span className="text-[10px] uppercase font-bold text-indigo-700 block">
              Mean Average
            </span>
            <div className="text-xl font-black text-indigo-900">{averageScore}%</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Class Position
            </span>
            <div className="text-xl font-black text-slate-900">
              {Number(averageScore) >= 80 ? '2nd of 34' : '6th of 34'}
            </div>
          </div>
        </div>

        {/* Character & Co-Curricular Assessment */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-sans text-xs space-y-2">
          <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
            Conduct, Character & Co-Curricular Assessment
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <span className="text-slate-500 block text-[11px]">Discipline & Conduct:</span>
              <span className="font-bold text-emerald-800">Exemplary & Courteous</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Clubs & Societies:</span>
              <span className="font-bold text-slate-800">Robotics & Debate Society</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Sports & Athletics:</span>
              <span className="font-bold text-slate-800">Track & Field (Long Jump)</span>
            </div>
          </div>
        </div>

        {/* Official Teacher & Principal Comments */}
        <div className="font-sans text-xs space-y-4 pt-2">
          <div className="p-3 border border-slate-300 rounded-xl">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">
              Class Teacher's General Remarks:
            </span>
            <p className="font-serif text-sm mt-1 text-slate-800 italic">
              "{selectedStudent.firstName} is a focused, diligent learner who participates constructively in discussions and demonstrates high academic integrity. Keep up the high standards."
            </p>
            <div className="mt-3 flex justify-between items-end text-[11px] text-slate-500">
              <span>Class Teacher: Sarah Jenkins</span>
              <span>Signature: __________________________</span>
            </div>
          </div>

          <div className="p-3 border border-slate-300 rounded-xl">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">
              Principal's Official Recommendation:
            </span>
            <p className="font-serif text-sm mt-1 text-slate-800 italic">
              "An exceptional term of steady growth and academic accomplishment. Approved for progression with merit."
            </p>
            <div className="mt-4 flex justify-between items-end text-[11px] text-slate-500">
              <div>
                <span>Principal: Dr. Raymond Thorne, PhD</span>
                <div className="text-[10px] text-slate-400 mt-0.5">Next Term Resumes: May 4, 2026</div>
              </div>
              <div className="text-center">
                <div className="w-24 border-b border-slate-400 mb-1"></div>
                <span className="font-serif italic text-[10px]">Official School Stamp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
