/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardOverview } from './components/DashboardOverview';
import { EnrolmentManager } from './components/EnrolmentManager';
import { FeeManager } from './components/FeeManager';
import { GradingTracker } from './components/GradingTracker';
import { AttendanceTracker } from './components/AttendanceTracker';
import { TimetableManager } from './components/TimetableManager';
import { ExamPrintPortal } from './components/ExamPrintPortal';
import { ReportCardsManager } from './components/ReportCardsManager';
import { SystemSpecificationViewer } from './components/SystemSpecificationViewer';
import { SystemSettingsManager } from './components/SystemSettingsManager';

import {
  User,
  Student,
  FeePayment,
  GradeRecord,
  AttendanceAnalytics,
  TimetableSlot,
  ExamPaper,
  UserRole,
  PrintStatus,
  AttendanceStatus
} from './types';
import { api } from './lib/api';
import {
  DEMO_USERS,
  INITIAL_STUDENTS,
  INITIAL_PAYMENTS,
  INITIAL_GRADES,
  INITIAL_TIMETABLE,
  INITIAL_EXAMS,
  ATTENDANCE_ANALYTICS
} from './data/mockData';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Users & Role Switching (Dr. Arthur Pendelton - Admin, Sarah Jenkins - Teacher, Marcus Vance - Teacher)
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0]);

  // Database Connection Status
  const [dbStatus, setDbStatus] = useState<{ provider: string; connected: boolean }>({
    provider: 'Embedded Mongo Engine',
    connected: true
  });

  // Core Data Collections
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [payments, setPayments] = useState<FeePayment[]>(INITIAL_PAYMENTS);
  const [grades, setGrades] = useState<GradeRecord[]>(INITIAL_GRADES);
  const [analytics, setAnalytics] = useState<AttendanceAnalytics>(ATTENDANCE_ANALYTICS);
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>(INITIAL_TIMETABLE);
  const [exams, setExams] = useState<ExamPaper[]>(INITIAL_EXAMS);

  // Collapsible Sidebar State with localStorage persistence
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pcea_sms_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('pcea_sms_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Keyboard shortcut: Ctrl + B or Cmd + B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        // Only toggle if not currently typing in an input/textarea
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea' && tag !== 'select') {
          e.preventDefault();
          handleToggleSidebar();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Switch Active User / Role
  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    showToast(`Switched active profile to ${user.name} (${user.role.toUpperCase()}).`);
  };

  // Sync data with backend API
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [
          fetchedUsers,
          health,
          fetchedStudents,
          fetchedSummary,
          fetchedGrades,
          fetchedAnalytics,
          fetchedTimetable,
          fetchedExams
        ] = await Promise.all([
          api.getUsers().catch(() => DEMO_USERS),
          api.getHealth().catch(() => ({ database: { connected: true, provider: 'High-Speed Database' } })),
          api.getStudents().catch(() => INITIAL_STUDENTS),
          api.getFeeSummary().catch(() => null),
          api.getGrades().catch(() => INITIAL_GRADES),
          api.getAttendanceAnalytics().catch(() => ATTENDANCE_ANALYTICS),
          api.getTimetable().catch(() => INITIAL_TIMETABLE),
          api.getExams().catch(() => INITIAL_EXAMS)
        ]);

        if (fetchedUsers && fetchedUsers.length > 0) setUsers(fetchedUsers);
        if (health?.database) setDbStatus(health.database);
        if (fetchedStudents && fetchedStudents.length > 0) setStudents(fetchedStudents);
        if (fetchedSummary?.recentPayments) setPayments(fetchedSummary.recentPayments);
        if (fetchedGrades && fetchedGrades.length > 0) setGrades(fetchedGrades);
        if (fetchedAnalytics) setAnalytics(fetchedAnalytics);
        if (fetchedTimetable && fetchedTimetable.length > 0) setTimetableSlots(fetchedTimetable);
        if (fetchedExams && fetchedExams.length > 0) setExams(fetchedExams);
      } catch (err) {
        console.error('Data bootstrap error:', err);
      }
    };

    bootstrap();
  }, []);

  // Compute fee summary metrics
  const totalBilled = students.reduce((acc, s) => acc + s.totalFeesBilled, 0);
  const totalCollected = students.reduce((acc, s) => acc + s.totalFeesPaid, 0);
  const totalOutstanding = Math.max(0, totalBilled - totalCollected);
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;
  const feeSummary = { totalBilled, totalCollected, totalOutstanding, collectionRate };

  const pendingExamsCount = exams.filter(
    (e) => e.printStatus === 'pending_approval' || e.printStatus === 'queued'
  ).length;

  // --- Handlers ---

  // Enrolment
  const handleAddStudent = async (newStudentData: Partial<Student>) => {
    try {
      const created = await api.createStudent(newStudentData);
      setStudents((prev) => [created, ...prev]);
      showToast(`Learner ${created.firstName} ${created.lastName} successfully enrolled.`);
    } catch (err: any) {
      showToast(`Error enrolling learner: ${err.message}`);
    }
  };

  // Fee Payment
  const handleRecordPayment = async (data: {
    studentId: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
    recordedBy: string;
  }) => {
    try {
      const result = await api.recordFeePayment(data);
      const newPayment = result.payment;
      setPayments((prev) => [newPayment, ...prev]);

      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === data.studentId) {
            const newPaid = s.totalFeesPaid + data.amount;
            const newBalance = Math.max(0, s.totalFeesBilled - newPaid);
            return {
              ...s,
              totalFeesPaid: newPaid,
              feeBalance: newBalance
            };
          }
          return s;
        })
      );
      showToast(`Fee receipt #${newPayment.receiptNumber} generated for KES ${data.amount.toLocaleString()}.`);
    } catch (err: any) {
      showToast(`Error recording fee payment: ${err.message}`);
    }
  };

  // Grading
  const handleSaveGrades = async (updates: Partial<GradeRecord>[]) => {
    try {
      await api.saveGrades(updates);
      setGrades((prev) => {
        const next = [...prev];
        updates.forEach((u) => {
          const idx = next.findIndex(
            (g) =>
              g.studentId === u.studentId &&
              g.subject.toLowerCase() === u.subject?.toLowerCase() &&
              g.assessmentType === u.assessmentType
          );
          if (idx >= 0) {
            next[idx] = { ...next[idx], ...u } as GradeRecord;
          } else if (u.studentId) {
            next.push({
              id: `gr_${Date.now()}_${Math.random()}`,
              studentId: u.studentId,
              studentName: u.studentName || '',
              admissionNumber: u.admissionNumber || '',
              grade: u.grade || 'Grade 10-A',
              subject: u.subject || 'Mathematics',
              term: u.term || 'Term 1',
              academicYear: '2026',
              assessmentType: u.assessmentType || 'End-Term',
              score: u.score || 0,
              maxScore: 100,
              percentage: u.percentage || u.score || 0,
              letterGrade: u.letterGrade || 'B',
              remarks: u.remarks || '',
              recordedBy: currentUser.name,
              updatedAt: new Date().toISOString().split('T')[0]
            });
          }
        });
        return next;
      });
      showToast(`Marks published successfully for ${updates.length} students.`);
    } catch (err: any) {
      showToast(`Error saving grades: ${err.message}`);
    }
  };

  // Attendance
  const handleRecordAttendance = async (data: {
    date: string;
    grade: string;
    records: {
      studentId: string;
      studentName: string;
      admissionNumber: string;
      status: AttendanceStatus;
      reason?: string;
    }[];
    recordedBy: string;
  }) => {
    try {
      await api.recordAttendance(data);

      const present = data.records.filter((r) => r.status === 'present').length;
      const total = data.records.length;
      const rate = total > 0 ? Math.round((present / total) * 100) : 100;

      // Update analytics
      setAnalytics((prev) => ({
        ...prev,
        presentToday: prev.presentToday + (present - 1),
        dailyTrends: [
          ...prev.dailyTrends.slice(1),
          {
            date: data.date,
            dayLabel: 'Today',
            rate,
            present,
            absent: total - present
          }
        ]
      }));

      showToast(`Attendance recorded for ${data.grade} (${rate}% present).`);
    } catch (err: any) {
      showToast(`Error saving attendance: ${err.message}`);
    }
  };

  // Timetable
  const handleAddSlot = async (slotData: Partial<TimetableSlot>) => {
    const newSlot = await api.addTimetableSlot(slotData);
    setTimetableSlots((prev) => [...prev, newSlot]);
    showToast(`Added ${newSlot.subject} to ${newSlot.grade} schedule.`);
  };

  const handleDeleteSlot = async (id: string) => {
    await api.deleteTimetableSlot(id);
    setTimetableSlots((prev) => prev.filter((s) => s.id !== id));
    showToast('Lesson slot removed from timetable.');
  };

  // Exams
  const handleUploadExam = async (examData: Partial<ExamPaper>) => {
    const newExam = await api.uploadExamPaper(examData);
    setExams((prev) => [newExam, ...prev]);
    showToast(`Exam paper "${newExam.title}" uploaded & queued for printing.`);
  };

  const handleUpdateExamStatus = async (
    id: string,
    status: PrintStatus,
    approvedBy?: string
  ) => {
    const updated = await api.updateExamStatus(id, status, approvedBy);
    setExams((prev) => prev.map((e) => (e.id === id ? updated : e)));
    showToast(`Exam status changed to ${status.replace('_', ' ').toUpperCase()}.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased w-full overflow-x-hidden">
      {/* Top Header Navbar */}
      <Navbar
        currentUser={currentUser}
        users={users}
        onSwitchUser={handleSwitchUser}
        onOpenSpec={() => setActiveTab('specification')}
        dbStatus={dbStatus}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
        pendingExamsCount={pendingExamsCount}
        activeStudentsCount={students.filter((s) => s.status === 'active').length}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar on desktop / Middle Navbar on mobile */}
        <Sidebar
          currentTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          userRole={currentUser.role}
          pendingExamsCount={pendingExamsCount}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />

        {/* Dynamic Content Body */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 lg:p-8 xl:p-8 2xl:p-10 pb-24 md:pb-8">
          <div className="w-full max-w-7xl xl:max-w-[1600px] 2xl:max-w-[1720px] mx-auto space-y-6">
            {/* Action Toast Feedback */}
            {toastMessage && (
              <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* Tab: Analytics Pulse & Overview */}
            {activeTab === 'dashboard' && (
              <DashboardOverview
                analytics={analytics}
                students={students}
                feeSummary={feeSummary}
                pendingExamsCount={pendingExamsCount}
                userRole={currentUser.role}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenNewStudentModal={() => setActiveTab('enrolment')}
              />
            )}

            {/* Tab: Learner Enrolment */}
            {activeTab === 'enrolment' && (
              <EnrolmentManager
                students={students}
                onAddStudent={handleAddStudent}
                userRole={currentUser.role}
                onViewReportCard={() => setActiveTab('reports')}
              />
            )}

            {/* Tab: Learner Fees & Finance */}
            {activeTab === 'fees' && (
              <FeeManager
                students={students}
                payments={payments}
                onRecordPayment={handleRecordPayment}
                userRole={currentUser.role}
              />
            )}

            {/* Tab: Academic Performance & Grading */}
            {activeTab === 'grading' && (
              <GradingTracker
                students={students}
                grades={grades}
                onSaveGrades={handleSaveGrades}
                userRole={currentUser.role}
                currentUserName={currentUser.name}
              />
            )}

            {/* Tab: Attendance Roll Call */}
            {activeTab === 'attendance' && (
              <AttendanceTracker
                students={students}
                onRecordAttendance={handleRecordAttendance}
                userRole={currentUser.role}
                currentUserName={currentUser.name}
              />
            )}

            {/* Tab: Master Timetable */}
            {activeTab === 'timetable' && (
              <TimetableManager
                slots={timetableSlots}
                onAddSlot={handleAddSlot}
                onDeleteSlot={handleDeleteSlot}
                userRole={currentUser.role}
              />
            )}

            {/* Tab: Exam Paper Upload & Printing */}
            {activeTab === 'exams' && (
              <ExamPrintPortal
                exams={exams}
                onUploadExam={handleUploadExam}
                onUpdateStatus={handleUpdateExamStatus}
                userRole={currentUser.role}
                currentUserName={currentUser.name}
              />
            )}

            {/* Tab: Terminal Report Cards */}
            {activeTab === 'reports' && (
              <ReportCardsManager
                students={students}
                grades={grades}
                userRole={currentUser.role}
              />
            )}

            {/* Tab: Non-Technical System Specification */}
            {activeTab === 'specification' && (
              <SystemSpecificationViewer />
            )}

            {/* Tab: System Settings & Permissions Matrix */}
            {activeTab === 'settings' && (
              <SystemSettingsManager
                currentUser={currentUser}
                users={users}
                onSwitchUser={handleSwitchUser}
                userRole={currentUser.role}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
