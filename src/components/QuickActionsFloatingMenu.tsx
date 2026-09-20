import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  X,
  CreditCard,
  UserPlus,
  CalendarCheck,
  FileSpreadsheet,
  FileText,
  Printer,
  Clock,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Search,
  DollarSign,
  User,
  Building2,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { Student, FeePayment, UserRole, PaymentMethod } from '../types';
import { TabType } from './Sidebar';
import { StudentFeeStatementModal } from './StudentFeeStatementModal';

interface QuickActionsFloatingMenuProps {
  students: Student[];
  payments: FeePayment[];
  currentUserName: string;
  userRole: UserRole;
  onNavigateTab: (tab: TabType) => void;
  onAddStudent: (student: Partial<Student>) => Promise<void>;
  onRecordPayment: (data: {
    studentId: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
    recordedBy: string;
  }) => Promise<void>;
}

export const QuickActionsFloatingMenu: React.FC<QuickActionsFloatingMenuProps> = ({
  students,
  payments,
  currentUserName,
  userRole,
  onNavigateTab,
  onAddStudent,
  onRecordPayment
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEnrolmentModal, setShowEnrolmentModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [statementStudentId, setStatementStudentId] = useState<string>('');

  // Payment form state
  const [paymentStudentId, setPaymentStudentId] = useState<string>(students[0]?.id || '');
  const [paymentAmount, setPaymentAmount] = useState<string>('15000');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Mobile Money');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Enrolment form state
  const [enrolmentData, setEnrolmentData] = useState({
    firstName: '',
    lastName: '',
    admissionNumber: `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    dateOfBirth: '2010-05-14',
    grade: 'Grade 10-A',
    stream: 'Alpha',
    guardianName: '',
    guardianRelationship: 'Mother',
    guardianPhone: '+254 7',
    guardianEmail: '',
    address: 'Nairobi, Kenya',
    emergencyContact: ''
  });
  const [isSubmittingEnrolment, setIsSubmittingEnrolment] = useState(false);
  const [enrolmentError, setEnrolmentError] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Global keyboard shortcuts: Press "Q" to toggle menu, "Escape" to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setShowPaymentModal(false);
        setShowEnrolmentModal(false);
        setShowStatementModal(false);
        return;
      }

      // "Q" key to toggle (when not typing in form field)
      if (e.key.toLowerCase() === 'q') {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea' && tag !== 'select') {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update default student if list changes
  useEffect(() => {
    if (students.length > 0 && !paymentStudentId) {
      setPaymentStudentId(students[0].id);
    }
  }, [students, paymentStudentId]);

  const selectedPaymentStudent = students.find((s) => s.id === paymentStudentId) || students[0];

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);
    const amountNum = parseFloat(paymentAmount);

    if (!amountNum || amountNum <= 0) {
      setPaymentError('Please enter a valid payment amount greater than KES 0.');
      return;
    }

    if (!paymentStudentId) {
      setPaymentError('Please select a learner.');
      return;
    }

    setIsSubmittingPayment(true);
    try {
      await onRecordPayment({
        studentId: paymentStudentId,
        amount: amountNum,
        paymentMethod,
        notes: paymentNotes || `Fee remittance via ${paymentMethod}`,
        recordedBy: currentUserName
      });
      setShowPaymentModal(false);
      setPaymentNotes('');
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to record payment');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleEnrolmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnrolmentError(null);

    if (!enrolmentData.firstName.trim() || !enrolmentData.lastName.trim()) {
      setEnrolmentError('Please enter both first and last name for the learner.');
      return;
    }

    if (!enrolmentData.guardianName.trim() || !enrolmentData.guardianPhone.trim()) {
      setEnrolmentError('Please provide guardian name and contact telephone.');
      return;
    }

    setIsSubmittingEnrolment(true);
    try {
      const billedFee = enrolmentData.grade.includes('11') || enrolmentData.grade.includes('12') ? 52000 : 45000;
      await onAddStudent({
        ...enrolmentData,
        status: 'active',
        enrollmentDate: new Date().toISOString().split('T')[0],
        totalFeesBilled: billedFee,
        totalFeesPaid: 0,
        feeBalance: billedFee,
        attendancePercentage: 100
      });

      setShowEnrolmentModal(false);
      // Reset form
      setEnrolmentData({
        firstName: '',
        lastName: '',
        admissionNumber: `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        gender: 'Male',
        dateOfBirth: '2010-05-14',
        grade: 'Grade 10-A',
        stream: 'Alpha',
        guardianName: '',
        guardianRelationship: 'Mother',
        guardianPhone: '+254 7',
        guardianEmail: '',
        address: 'Nairobi, Kenya',
        emergencyContact: ''
      });
    } catch (err: any) {
      setEnrolmentError(err.message || 'Failed to enroll student');
    } finally {
      setIsSubmittingEnrolment(false);
    }
  };

  const quickActionItems = [
    {
      id: 'record-payment',
      title: 'Record Fee Payment',
      subtitle: 'Post fee installment & print instant receipt',
      badge: 'Finance',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      icon: CreditCard,
      iconColor: 'text-emerald-600 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white',
      onClick: () => {
        setIsOpen(false);
        setShowPaymentModal(true);
      }
    },
    {
      id: 'enroll-student',
      title: 'Enroll New Student',
      subtitle: 'Admit learner & register parent dossier',
      badge: 'Admissions',
      badgeColor: 'bg-orange-100 text-orange-800',
      icon: UserPlus,
      iconColor: 'text-orange-600 bg-orange-50 group-hover:bg-orange-600 group-hover:text-white',
      onClick: () => {
        setIsOpen(false);
        setShowEnrolmentModal(true);
      }
    },
    {
      id: 'fee-statement',
      title: 'Generate Fee Statement',
      subtitle: 'Official printable PDF ledger & bank info',
      badge: 'Bursary',
      badgeColor: 'bg-amber-100 text-amber-800',
      icon: FileText,
      iconColor: 'text-amber-600 bg-amber-50 group-hover:bg-amber-600 group-hover:text-white',
      onClick: () => {
        setIsOpen(false);
        setStatementStudentId(students[0]?.id || '');
        setShowStatementModal(true);
      }
    },
    {
      id: 'attendance-call',
      title: 'Take Morning Roll Call',
      subtitle: 'Mark daily presence, absence & tardiness',
      badge: 'Daily',
      badgeColor: 'bg-teal-100 text-teal-800',
      icon: CalendarCheck,
      iconColor: 'text-teal-600 bg-teal-50 group-hover:bg-teal-600 group-hover:text-white',
      onClick: () => {
        setIsOpen(false);
        onNavigateTab('attendance');
      }
    },
    {
      id: 'input-grades',
      title: 'Input Academic Marks',
      subtitle: 'Enter continuous assessment & exam scores',
      badge: 'Grading',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      icon: FileSpreadsheet,
      iconColor: 'text-indigo-600 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white',
      onClick: () => {
        setIsOpen(false);
        onNavigateTab('grading');
      }
    },
    {
      id: 'exam-print',
      title: 'Exam Print Room Portal',
      subtitle: 'Upload question papers & verify print queue',
      badge: 'Exams',
      badgeColor: 'bg-purple-100 text-purple-800',
      icon: Printer,
      iconColor: 'text-purple-600 bg-purple-50 group-hover:bg-purple-600 group-hover:text-white',
      onClick: () => {
        setIsOpen(false);
        onNavigateTab('exams');
      }
    }
  ];

  return (
    <>
      {/* Floating Action Speed Dial Button (Anchored Bottom-Right) */}
      <div ref={menuRef} className="fixed bottom-7 right-7 z-40 print:hidden flex flex-col items-end">
        {/* Floating Menu Popover */}
        {isOpen && (
          <div
            id="quick-actions-floating-popover"
            className="mb-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
          >
            {/* Popover Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-3.5 text-white flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
                  <Zap className="w-4 h-4 fill-orange-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                      Quick Actions
                    </h3>
                    <span className="px-1.5 py-0.2 rounded bg-orange-500 text-white font-mono text-[9px] font-black">
                      SHORTCUTS
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">PCEA St. Andrews School Workflows</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                  Press [Q]
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close menu (ESC)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Action Items List */}
            <div className="p-2 divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
              {quickActionItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    id={`quick-action-btn-${item.id}`}
                    onClick={item.onClick}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${item.iconColor}`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                            {item.title}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug">{item.subtitle}</p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>

            {/* Popover Footer Info */}
            <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500">
              <span>Logged in as: <strong className="text-slate-800">{currentUserName}</strong></span>
              <span className="text-slate-400">Esc to dismiss</span>
            </div>
          </div>
        )}

        {/* Primary FAB Trigger Button */}
        <button
          id="quick-actions-floating-trigger"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`group flex items-center gap-2.5 px-4 py-3 rounded-full font-bold text-xs shadow-xl transition-all duration-200 cursor-pointer ${
            isOpen
              ? 'bg-slate-900 hover:bg-black text-white shadow-slate-900/30'
              : 'bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/35 hover:shadow-orange-500/45 hover:scale-105 active:scale-95'
          }`}
          aria-expanded={isOpen}
          title="Quick Actions floating menu (Press Q)"
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200 ${
              isOpen ? 'rotate-90 bg-slate-800 text-white' : 'bg-white/20 text-white'
            }`}
          >
            {isOpen ? <X className="w-4 h-4" /> : <Zap className="w-3.5 h-3.5 fill-white" />}
          </div>
          <span className="tracking-wide">Quick Actions</span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
            Q
          </span>
        </button>
      </div>

      {/* 1. QUICK RECORD FEE PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-150 my-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-serif">
                    Quick Record Fee Payment
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Instantly credit learner fee ledger and adjust arrears
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {paymentError && (
              <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            <form onSubmit={handlePaymentSubmit} className="mt-4 space-y-3.5 text-xs">
              {/* Select Learner */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Learner *</label>
                <select
                  value={paymentStudentId}
                  onChange={(e) => setPaymentStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.admissionNumber}) • {s.grade} • Arrears: KES {s.feeBalance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Outstanding Arrears Snapshot */}
              {selectedPaymentStudent && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Current Arrears Balance
                    </span>
                    <span
                      className={`text-sm font-black ${
                        selectedPaymentStudent.feeBalance === 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      KES {selectedPaymentStudent.feeBalance.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Total Invoiced:</span>
                    <span className="font-bold text-slate-700 text-xs">
                      KES {selectedPaymentStudent.totalFeesBilled.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Amount and Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Amount Paid (KES) *
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    step="100"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/30 text-xs"
                  >
                    <option value="Mobile Money">Mobile Money (M-Pesa)</option>
                    <option value="Bank Transfer">Bank Transfer (EFT)</option>
                    <option value="Cash">Cash at Bursary</option>
                    <option value="Card">Debit / Credit Card</option>
                  </select>
                </div>
              </div>

              {/* Quick Amount Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-medium">Presets:</span>
                {selectedPaymentStudent && selectedPaymentStudent.feeBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(String(selectedPaymentStudent.feeBalance))}
                    className="px-2 py-0.5 rounded bg-orange-50 hover:bg-orange-100 text-orange-700 text-[10px] font-bold border border-orange-200 cursor-pointer"
                  >
                    Full Arrears (KES {selectedPaymentStudent.feeBalance.toLocaleString()})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPaymentAmount('10000')}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold cursor-pointer"
                >
                  10,000
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentAmount('20000')}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold cursor-pointer"
                >
                  20,000
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentAmount('30000')}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold cursor-pointer"
                >
                  30,000
                </button>
              </div>

              {/* Transaction Remarks */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Transaction Remarks / Reference
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. M-Pesa Ref QK99201 or Term 1 Installment 1"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{isSubmittingPayment ? 'Recording...' : 'Record Payment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. QUICK ENROL NEW STUDENT MODAL */}
      {showEnrolmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto animate-in fade-in duration-150 my-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-serif">
                    Quick Enroll New Student
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Creates student profile, allocates class, and sets up fee invoice
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEnrolmentModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {enrolmentError && (
              <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{enrolmentError}</span>
              </div>
            )}

            <form onSubmit={handleEnrolmentSubmit} className="mt-4 space-y-4 text-xs">
              {/* Section 1: Biodata */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                  1. Learner Biodata
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Samuel"
                      value={enrolmentData.firstName}
                      onChange={(e) => setEnrolmentData({ ...enrolmentData, firstName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Last / Surname *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mwangi"
                      value={enrolmentData.lastName}
                      onChange={(e) => setEnrolmentData({ ...enrolmentData, lastName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Admission No</label>
                    <input
                      type="text"
                      value={enrolmentData.admissionNumber}
                      onChange={(e) =>
                        setEnrolmentData({ ...enrolmentData, admissionNumber: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-slate-700 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Gender</label>
                    <select
                      value={enrolmentData.gender}
                      onChange={(e) =>
                        setEnrolmentData({ ...enrolmentData, gender: e.target.value as any })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Date of Birth</label>
                    <input
                      type="date"
                      value={enrolmentData.dateOfBirth}
                      onChange={(e) =>
                        setEnrolmentData({ ...enrolmentData, dateOfBirth: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Class / Grade</label>
                    <select
                      value={enrolmentData.grade}
                      onChange={(e) => setEnrolmentData({ ...enrolmentData, grade: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold text-slate-800"
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
                    <label className="block text-slate-600 mb-1 font-semibold">Stream</label>
                    <select
                      value={enrolmentData.stream}
                      onChange={(e) => setEnrolmentData({ ...enrolmentData, stream: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="Alpha">Alpha</option>
                      <option value="Beta">Beta</option>
                      <option value="North">North</option>
                      <option value="South">South</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Guardian Contacts */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
                  2. Parent & Emergency Contacts
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Guardian Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Grace Mwangi"
                      value={enrolmentData.guardianName}
                      onChange={(e) =>
                        setEnrolmentData({ ...enrolmentData, guardianName: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Relationship</label>
                    <select
                      value={enrolmentData.guardianRelationship}
                      onChange={(e) =>
                        setEnrolmentData({ ...enrolmentData, guardianRelationship: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Sponsor">Sponsor</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Telephone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+254 712 345 678"
                      value={enrolmentData.guardianPhone}
                      onChange={(e) =>
                        setEnrolmentData({ ...enrolmentData, guardianPhone: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Email Address</label>
                    <input
                      type="email"
                      placeholder="parent@example.com"
                      value={enrolmentData.guardianEmail}
                      onChange={(e) =>
                        setEnrolmentData({ ...enrolmentData, guardianEmail: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEnrolmentModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEnrolment}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isSubmittingEnrolment ? 'Enrolling...' : 'Complete Enrolment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. STUDENT FEE STATEMENT MODAL */}
      <StudentFeeStatementModal
        isOpen={showStatementModal}
        onClose={() => setShowStatementModal(false)}
        students={students}
        payments={payments}
        initialStudentId={statementStudentId}
        onRecordPayment={(stId) => {
          setPaymentStudentId(stId);
          setShowPaymentModal(true);
        }}
      />
    </>
  );
};
