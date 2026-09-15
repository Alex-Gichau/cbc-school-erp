import React, { useState, useEffect } from 'react';
import {
  Award,
  BookOpen,
  Filter,
  Save,
  CheckCircle,
  TrendingUp,
  BarChart2,
  AlertCircle,
  Users
} from 'lucide-react';
import { GradeRecord, Student, UserRole, LetterGrade } from '../types';

interface GradingTrackerProps {
  students: Student[];
  grades: GradeRecord[];
  onSaveGrades: (updates: Partial<GradeRecord>[]) => Promise<void>;
  userRole: UserRole;
  currentUserName: string;
}

export const GradingTracker: React.FC<GradingTrackerProps> = ({
  students,
  grades,
  onSaveGrades,
  userRole,
  currentUserName
}) => {
  const [selectedGrade, setSelectedGrade] = useState('Grade 10-A');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedAssessment, setSelectedAssessment] = useState<'Mid-Term' | 'End-Term' | 'Quiz' | 'Assignment'>('End-Term');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');

  // Local editable state for current class students
  const [localScores, setLocalScores] = useState<
    Record<string, { score: number; remarks: string; recordId?: string }>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Filter students in selected grade
  const classStudents = students.filter(
    (s) => s.grade.toLowerCase() === selectedGrade.toLowerCase()
  );

  // Sync with loaded grades
  useEffect(() => {
    const scoreMap: Record<string, { score: number; remarks: string; recordId?: string }> = {};

    classStudents.forEach((student) => {
      const match = grades.find(
        (g) =>
          g.studentId === student.id &&
          g.subject.toLowerCase() === selectedSubject.toLowerCase() &&
          g.assessmentType === selectedAssessment
      );

      if (match) {
        scoreMap[student.id] = {
          score: match.score,
          remarks: match.remarks,
          recordId: match.id
        };
      } else {
        // Default initial entry
        scoreMap[student.id] = {
          score: 70,
          remarks: 'Good progress and consistent class effort.'
        };
      }
    });

    setLocalScores(scoreMap);
  }, [selectedGrade, selectedSubject, selectedAssessment, grades]);

  const calculateGrade = (score: number): { grade: LetterGrade; label: string; color: string } => {
    if (score >= 80) return { grade: 'A', label: 'Distinction (80-100%)', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    if (score >= 70) return { grade: 'B', label: 'Very Good (70-79%)', color: 'bg-blue-50 text-blue-800 border-blue-200' };
    if (score >= 60) return { grade: 'C', label: 'Credit (60-69%)', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
    if (score >= 50) return { grade: 'D', label: 'Pass (50-59%)', color: 'bg-amber-50 text-amber-800 border-amber-200' };
    return { grade: 'F', label: 'Remedial Needed (<50%)', color: 'bg-rose-50 text-rose-800 border-rose-200' };
  };

  const handleScoreChange = (studentId: string, value: string) => {
    const num = Math.max(0, Math.min(100, Number(value) || 0));
    setLocalScores((prev) => {
      let smartRemark = prev[studentId]?.remarks || '';
      if (num >= 80) smartRemark = 'Outstanding grasp of complex concepts.';
      else if (num >= 70) smartRemark = 'Strong conceptual understanding and application.';
      else if (num >= 60) smartRemark = 'Satisfactory performance; needs extra practice.';
      else if (num >= 50) smartRemark = 'Borderline pass; encourage regular revision.';
      else smartRemark = 'Remedial support and teacher review requested.';

      return {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          score: num,
          remarks: smartRemark
        }
      };
    });
    setSaveSuccess(false);
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setLocalScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
    setSaveSuccess(false);
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      const updates: Partial<GradeRecord>[] = classStudents.map((student) => {
        const item = localScores[student.id] || { score: 70, remarks: 'Good work' };
        const { grade } = calculateGrade(item.score);
        return {
          id: item.recordId,
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          admissionNumber: student.admissionNumber,
          grade: selectedGrade,
          subject: selectedSubject,
          term: selectedTerm,
          assessmentType: selectedAssessment,
          score: item.score,
          maxScore: 100,
          percentage: item.score,
          letterGrade: grade,
          remarks: item.remarks,
          recordedBy: currentUserName
        };
      });

      await onSaveGrades(updates);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // Performance calculations
  const scoresArray = classStudents.map((s) => localScores[s.id]?.score || 0);
  const classAvg =
    scoresArray.length > 0
      ? (scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length).toFixed(1)
      : '0';
  const highestScore = scoresArray.length > 0 ? Math.max(...scoresArray) : 0;
  const lowestScore = scoresArray.length > 0 ? Math.min(...scoresArray) : 0;
  const passCount = scoresArray.filter((s) => s >= 50).length;
  const passRate =
    scoresArray.length > 0 ? Math.round((passCount / scoresArray.length) * 100) : 0;

  // Grade distributions
  const gradeCounts = {
    A: scoresArray.filter((s) => s >= 80).length,
    B: scoresArray.filter((s) => s >= 70 && s < 80).length,
    C: scoresArray.filter((s) => s >= 60 && s < 70).length,
    D: scoresArray.filter((s) => s >= 50 && s < 60).length,
    F: scoresArray.filter((s) => s < 50).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-bold text-slate-900 font-serif">
              Academic Performance & Grading Matrix
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standardized letter grade tracking, test score entry, auto-calculated marks, and performance insights.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/15 transition-all cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <span>Saving...</span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Publish Marks</span>
            </>
          )}
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>All class marks and teacher remarks have been saved to the database.</span>
        </div>
      )}

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Class / Grade
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
            >
              <option value="Grade 10-A">Grade 10-A</option>
              <option value="Grade 11-A">Grade 11-A</option>
              <option value="Grade 9-A">Grade 9-A</option>
              <option value="Grade 12-A">Grade 12-A</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
            >
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="English Literature">English Literature</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="History & Citizenship">History & Citizenship</option>
              <option value="Geography">Geography</option>
              <option value="Computer Studies">Computer Studies</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Assessment Type
            </label>
            <select
              value={selectedAssessment}
              onChange={(e) => setSelectedAssessment(e.target.value as any)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
            >
              <option value="End-Term">End-Term Examination</option>
              <option value="Mid-Term">Mid-Term Assessment</option>
              <option value="Quiz">Continuous Quiz</option>
              <option value="Assignment">Homework Assignment</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Academic Term
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
            >
              <option value="Term 1">Term 1 - 2026</option>
              <option value="Term 2">Term 2 - 2026</option>
              <option value="Term 3">Term 3 - 2026</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Roster: {classStudents.length} Students in {selectedGrade}
        </div>
      </div>

      {/* Class Performance Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Class Mean Score
          </span>
          <div className="text-xl font-black text-slate-900 mt-1">{classAvg}%</div>
          <p className="text-[11px] text-slate-500">Across {selectedSubject}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Class Pass Rate
          </span>
          <div className="text-xl font-black text-emerald-700 mt-1">{passRate}%</div>
          <p className="text-[11px] text-slate-500">{passCount} scored &gt;= 50%</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Highest Mark
          </span>
          <div className="text-xl font-black text-indigo-700 mt-1">{highestScore}%</div>
          <p className="text-[11px] text-slate-500">Top performance</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Grade Distribution
          </span>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              A:{gradeCounts.A}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
              B:{gradeCounts.B}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
              C:{gradeCounts.C}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
              D:{gradeCounts.D}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
              F:{gradeCounts.F}
            </span>
          </div>
        </div>
      </div>

      {/* Gradebook Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3 px-4">Adm No.</th>
                <th className="py-3 px-4">Learner Name</th>
                <th className="py-3 px-4 w-28">Score (/100)</th>
                <th className="py-3 px-4 w-32">Letter Grade</th>
                <th className="py-3 px-4">Teacher's Pedagogical Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map((student) => {
                const item = localScores[student.id] || { score: 70, remarks: '' };
                const gradeInfo = calculateGrade(item.score);

                return (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-600">
                      {student.admissionNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.score}
                          onChange={(e) => handleScoreChange(student.id, e.target.value)}
                          className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-center text-sm"
                        />
                        <span className="text-slate-400 font-medium">%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black border ${gradeInfo.color}`}
                      >
                        Grade {gradeInfo.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={item.remarks}
                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                        placeholder="Add remarks for report card..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-400 text-xs text-slate-800"
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
