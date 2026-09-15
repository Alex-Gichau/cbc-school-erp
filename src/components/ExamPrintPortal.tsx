import React, { useState } from 'react';
import {
  Printer,
  UploadCloud,
  FileText,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Sliders,
  Layers,
  Sparkles,
  Download,
  Eye,
  AlertCircle,
  X
} from 'lucide-react';
import { ExamPaper, UserRole, PrintStatus } from '../types';

interface ExamPrintPortalProps {
  exams: ExamPaper[];
  onUploadExam: (data: Partial<ExamPaper>) => Promise<void>;
  onUpdateStatus: (id: string, status: PrintStatus, approvedBy?: string) => Promise<void>;
  userRole: UserRole;
  currentUserName: string;
}

export const ExamPrintPortal: React.FC<ExamPrintPortalProps> = ({
  exams,
  onUploadExam,
  onUpdateStatus,
  userRole,
  currentUserName
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedExamForPreview, setSelectedExamForPreview] = useState<ExamPaper | null>(null);
  const [selectedExamSlip, setSelectedExamSlip] = useState<ExamPaper | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Mathematics',
    grade: 'Grade 10-A',
    examDate: '2026-03-25',
    durationMinutes: 90,
    copiesRequired: 38,
    paperType: 'A4' as 'A4' | 'Legal',
    sides: 'double' as 'single' | 'double',
    colorMode: 'black_white' as 'black_white' | 'color',
    finishing: 'stapled' as 'stapled' | 'loose',
    confidentialityLevel: 'High Security' as 'Standard' | 'Strict' | 'High Security',
    specialInstructions: 'Print double-sided with 2 extra copies for invigilator desk. Store in sealed exam locker.',
    fileName: 'Term1_Exam_Paper.pdf',
    questionsPreview: [
      'Question 1: Candidates must attempt all questions in Section A and choose three from Section B.',
      'Question 2: Show all working clearly; marks will be awarded for structured step-by-step logic.',
      'Question 3: Ensure your index number is entered correctly in the designated boxes above.'
    ]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredExams = exams.filter((exam) => {
    if (statusFilter === 'all') return true;
    return exam.printStatus === statusFilter;
  });

  const getStatusBadge = (status: PrintStatus) => {
    switch (status) {
      case 'pending_approval':
        return { label: 'Pending Approval', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'queued':
        return { label: 'In Print Queue', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'printing':
        return { label: 'Printing in Progress', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'ready_for_pickup':
        return { label: 'Ready for Collection', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'collected':
        return { label: 'Dispatched / Collected', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setIsSubmitting(true);
      await onUploadExam({
        ...formData,
        teacherName: currentUserName,
        teacherId: 'user_teacher_1'
      });
      setShowUploadModal(false);
      setFormData({
        title: '',
        subject: 'Mathematics',
        grade: 'Grade 10-A',
        examDate: '2026-03-25',
        durationMinutes: 90,
        copiesRequired: 38,
        paperType: 'A4',
        sides: 'double',
        colorMode: 'black_white',
        finishing: 'stapled',
        confidentialityLevel: 'High Security',
        specialInstructions: '',
        fileName: 'Exam_Paper.pdf',
        questionsPreview: [
          'Instructions: Answer all questions in Section A.',
          'Formula sheet is attached at the back.'
        ]
      });
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
            <Printer className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-bold text-slate-900 font-serif">
              Exam Paper Upload & Printing Requisition
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Teachers upload assessment papers; print room manages photocopying, stapling, and confidential lockers.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/15 transition-all cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Exam for Printing</span>
        </button>
      </div>

      {/* Filter and Status Pipeline Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
            Total Requisitions
          </span>
          <span className="text-lg font-black">{exams.length}</span>
        </button>

        <button
          onClick={() => setStatusFilter('pending_approval')}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === 'pending_approval'
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
            Pending Approval
          </span>
          <span className="text-lg font-black">
            {exams.filter((e) => e.printStatus === 'pending_approval').length}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('queued')}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === 'queued'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
            In Print Queue
          </span>
          <span className="text-lg font-black">
            {exams.filter((e) => e.printStatus === 'queued').length}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('printing')}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === 'printing'
              ? 'bg-purple-600 text-white border-purple-600'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
            On Printing Press
          </span>
          <span className="text-lg font-black">
            {exams.filter((e) => e.printStatus === 'printing').length}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('ready_for_pickup')}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === 'ready_for_pickup'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
            Ready in Locker
          </span>
          <span className="text-lg font-black">
            {exams.filter((e) => e.printStatus === 'ready_for_pickup').length}
          </span>
        </button>
      </div>

      {/* Requisition Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3 px-4">Exam Details</th>
                <th className="py-3 px-4">Subject & Grade</th>
                <th className="py-3 px-4">Exam Date</th>
                <th className="py-3 px-4">Copies & Specs</th>
                <th className="py-3 px-4">Teacher</th>
                <th className="py-3 px-4">Print Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExams.map((exam) => {
                const status = getStatusBadge(exam.printStatus);
                return (
                  <tr key={exam.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{exam.title}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono">{exam.fileName}</span>
                        <span>•</span>
                        <span className="text-rose-600 font-semibold">{exam.confidentialityLevel}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block font-semibold text-slate-800">{exam.subject}</span>
                      <div className="text-[10px] text-indigo-700 font-bold">{exam.grade}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{exam.examDate}</div>
                      <div className="text-[10px] text-slate-400">{exam.durationMinutes} Minutes</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{exam.copiesRequired} copies</div>
                      <div className="text-[10px] text-slate-500 capitalize">
                        {exam.sides}-sided • {exam.colorMode === 'color' ? 'Full Color' : 'B&W'} •{' '}
                        {exam.finishing}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{exam.teacherName}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedExamForPreview(exam)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
                          title="Preview Exam Paper"
                        >
                          <Eye className="w-3.5 h-3.5 inline mr-1" />
                          <span>Preview</span>
                        </button>

                        <button
                          onClick={() => setSelectedExamSlip(exam)}
                          className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium text-xs transition-colors cursor-pointer"
                          title="Print Job Slip for Print Room"
                        >
                          Print Slip
                        </button>

                        {userRole === 'admin' && (
                          <select
                            value={exam.printStatus}
                            onChange={(e) =>
                              onUpdateStatus(exam.id, e.target.value as PrintStatus, currentUserName)
                            }
                            className="text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-300 bg-white"
                          >
                            <option value="pending_approval">Pending</option>
                            <option value="queued">Queued</option>
                            <option value="printing">Printing</option>
                            <option value="ready_for_pickup">Ready</option>
                            <option value="collected">Collected</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teacher Upload Requisition Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-serif">
                  Submit Exam Paper for Printing
                </h2>
                <p className="text-xs text-slate-500">
                  Sends exam requisition to the school print room with exact copy requirements.
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Exam Paper Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 10 Mid-Term Mathematics Assessment Paper 1"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="English Literature">English Literature</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Geography">Geography</option>
                    <option value="History">History</option>
                    <option value="Computer Studies">Computer Studies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Class</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
                  >
                    <option value="Grade 10-A">Grade 10-A (34 students)</option>
                    <option value="Grade 11-A">Grade 11-A (32 students)</option>
                    <option value="Grade 9-A">Grade 9-A (35 students)</option>
                    <option value="Grade 12-A">Grade 12-A (30 students)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Exam Date</label>
                  <input
                    type="date"
                    value={formData.examDate}
                    onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    min="30"
                    max="240"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Total Copies</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={formData.copiesRequired}
                    onChange={(e) => setFormData({ ...formData, copiesRequired: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  />
                </div>
              </div>

              {/* Printing Specs */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                  Printing & Finishing Specifications
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-slate-500 mb-1 text-[11px]">Sides</label>
                    <select
                      value={formData.sides}
                      onChange={(e) => setFormData({ ...formData, sides: e.target.value as any })}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="double">Double-Sided</option>
                      <option value="single">Single-Sided</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 text-[11px]">Color Mode</label>
                    <select
                      value={formData.colorMode}
                      onChange={(e) => setFormData({ ...formData, colorMode: e.target.value as any })}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="black_white">Black & White</option>
                      <option value="color">Full Color</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 text-[11px]">Finishing</label>
                    <select
                      value={formData.finishing}
                      onChange={(e) => setFormData({ ...formData, finishing: e.target.value as any })}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="stapled">Stapled Booklet</option>
                      <option value="loose">Loose Sheets</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 text-[11px]">Security</label>
                    <select
                      value={formData.confidentialityLevel}
                      onChange={(e) => setFormData({ ...formData, confidentialityLevel: e.target.value as any })}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-rose-700"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Strict">Strict</option>
                      <option value="High Security">High Security</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Special Notes for Print Room
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Include 2 spare copies for invigilator desk and store in sealed exam locker."
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              {/* File Upload Box */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <UploadCloud className="w-8 h-8 text-orange-500 mx-auto mb-1" />
                <div className="text-xs font-bold text-slate-800">
                  Exam Master Document Attached
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  {formData.fileName} (1.4 MB - Verified PDF)
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit to Print Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exam Preview Modal */}
      {selectedExamForPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Exam Paper Print Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs transition-colors cursor-pointer border border-orange-200"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Send to Printer</span>
                </button>
                <button
                  onClick={() => setSelectedExamForPreview(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Exam Paper Sheet Simulation */}
            <div className="mt-4 p-8 border border-slate-300 rounded-xl bg-white shadow-xs font-serif text-slate-900 space-y-6">
              {/* Exam Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <h1 className="text-xl font-black uppercase tracking-wider">
                  PCEA ST ANDREWS KINDERGARTEN
                </h1>
                <p className="text-xs font-sans uppercase font-bold text-slate-600 mt-0.5">
                  Academic Term 1 • Summative Assessment
                </p>
                <div className="text-sm font-bold mt-2">{selectedExamForPreview.title}</div>
                <div className="flex items-center justify-center gap-6 mt-3 text-xs font-sans font-medium text-slate-700 border-t border-slate-200 pt-2">
                  <span>Subject: {selectedExamForPreview.subject}</span>
                  <span>Target: {selectedExamForPreview.grade}</span>
                  <span>Time Allowed: {selectedExamForPreview.durationMinutes} Minutes</span>
                </div>
              </div>

              {/* Student Candidate Info Block */}
              <div className="p-3 border border-slate-300 rounded-lg text-xs font-sans grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block text-[10px]">CANDIDATE NAME:</span>
                  <div className="border-b border-dotted border-slate-400 h-6"></div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">INDEX / ADMISSION NUMBER:</span>
                  <div className="border-b border-dotted border-slate-400 h-6"></div>
                </div>
              </div>

              {/* Instructions to Candidates */}
              <div className="text-xs font-sans space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold uppercase text-[10px] text-slate-700 block">
                  Instructions to Candidates:
                </span>
                <ol className="list-decimal list-inside space-y-1 text-slate-700">
                  <li>Write your name and admission number clearly in the spaces provided above.</li>
                  <li>This paper consists of designated questions; check that no pages are missing.</li>
                  <li>Non-programmable calculators may be used unless instructed otherwise.</li>
                </ol>
              </div>

              {/* Question Preview Body */}
              <div className="space-y-4 pt-2 font-serif text-xs">
                <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] font-sans">
                  Section A: Core Examination Problems
                </div>
                {selectedExamForPreview.questionsPreview?.map((q, idx) => (
                  <div key={idx} className="p-3 bg-slate-50/50 rounded-lg border border-slate-200">
                    <p className="leading-relaxed">{q}</p>
                    <div className="h-12 border-b border-dashed border-slate-300 mt-2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Requisition Slip Modal */}
      {selectedExamSlip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Print Room Job Docket
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 inline mr-1" />
                  Print Ticket
                </button>
                <button
                  onClick={() => setSelectedExamSlip(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 p-5 border-2 border-slate-900 rounded-xl bg-slate-50/60 text-xs font-mono space-y-3">
              <div className="text-center pb-2 border-b border-slate-300">
                <div className="font-black text-sm text-slate-900">PCEA ST ANDREWS PRINT ROOM REQUISITION</div>
                <div className="text-[10px] text-slate-500">Ticket ID: #{selectedExamSlip.id}</div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">EXAM TITLE:</span>
                <span className="font-bold text-slate-900">{selectedExamSlip.title}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">SUBJECT / GRADE:</span>
                  <span className="font-bold text-slate-800">
                    {selectedExamSlip.subject} ({selectedExamSlip.grade})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">EXAM DATE:</span>
                  <span className="font-bold text-slate-800">{selectedExamSlip.examDate}</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded border border-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Quantity Required:</span>
                  <span className="font-black text-slate-900">{selectedExamSlip.copiesRequired} copies</span>
                </div>
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="capitalize">{selectedExamSlip.sides}-sided, {selectedExamSlip.colorMode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Binding:</span>
                  <span className="capitalize">{selectedExamSlip.finishing}</span>
                </div>
                <div className="flex justify-between">
                  <span>Security Level:</span>
                  <span className="font-bold text-rose-700">{selectedExamSlip.confidentialityLevel}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px]">SPECIAL INSTRUCTIONS:</span>
                <span className="italic text-slate-700">{selectedExamSlip.specialInstructions || 'None'}</span>
              </div>

              <div className="pt-2 border-t border-slate-300 flex justify-between text-[10px]">
                <span>Teacher: {selectedExamSlip.teacherName}</span>
                <span>Print Room Officer: ________________</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
