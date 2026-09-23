import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Eye,
  SlidersHorizontal,
  Search,
  Filter,
  Users,
  CreditCard,
  Award,
  CheckCircle,
  CalendarDays,
  Printer,
  FileSpreadsheet,
  Settings,
  Info,
  Building2,
  Calendar,
  History,
  ArrowRight,
  Sparkles,
  ChevronRight,
  HelpCircle,
  X,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { User, UserRole, ThemeMode } from '../types';
import { ThemeSwitcher } from './ThemeSwitcher';

export interface FeaturePermission {
  id: string;
  category: 'admissions' | 'finance' | 'academics' | 'attendance' | 'timetable' | 'exams' | 'reports' | 'system';
  categoryLabel: string;
  name: string;
  description: string;
  adminAccess: 'full' | 'manage' | 'view';
  teacherAccess: 'full' | 'manage' | 'view' | 'none';
  adminCapabilities: string[];
  teacherCapabilities: string[];
  governanceRationale: string;
  enforcingComponent: string;
}

const PERMISSIONS_DATA: FeaturePermission[] = [
  // 1. Learner Enrolment & Admissions
  {
    id: 'enrol_view',
    category: 'admissions',
    categoryLabel: 'Learner Admissions & Directory',
    name: 'View Student Directory & Detailed Profiles',
    description: 'Browse the complete learner roster, search by admission number, and inspect full student dossiers.',
    adminAccess: 'full',
    teacherAccess: 'full',
    adminCapabilities: ['Read', 'Filter', 'Search', 'Export'],
    teacherCapabilities: ['Read', 'Filter', 'Search'],
    governanceRationale: 'Teachers must recognize all students in the school, review medical alerts, and access guardian emergency contacts.',
    enforcingComponent: 'EnrolmentManager.tsx'
  },
  {
    id: 'enrol_admit',
    category: 'admissions',
    categoryLabel: 'Learner Admissions & Directory',
    name: 'Admit New Learner & Assign Admission Number',
    description: 'Create new learner profiles, register admission certificates, allocate grade streams, and initialize fee accounts.',
    adminAccess: 'full',
    teacherAccess: 'none',
    adminCapabilities: ['Create', 'Assign Reg No.', 'Set Fees'],
    teacherCapabilities: ['Restricted'],
    governanceRationale: 'Student admissions involve binding tuition agreements and statutory MOE registration managed strictly by the Principal & Bursar.',
    enforcingComponent: 'EnrolmentManager.tsx (Admit Learner modal)'
  },
  {
    id: 'enrol_edit_biodata',
    category: 'admissions',
    categoryLabel: 'Learner Admissions & Directory',
    name: 'Modify Legal Biodata & Status Records',
    description: 'Update official student birthdates, legal names, guardian affiliations, or change status to Transferred/Graduated.',
    adminAccess: 'full',
    teacherAccess: 'view',
    adminCapabilities: ['Update', 'Archive', 'Change Status'],
    teacherCapabilities: ['View Only'],
    governanceRationale: 'Protects legal student records from unauthorized modification; changes require verified administrative documentation.',
    enforcingComponent: 'EnrolmentManager.tsx'
  },
  {
    id: 'enrol_print_cards',
    category: 'admissions',
    categoryLabel: 'Learner Admissions & Directory',
    name: 'Print Learner Dossiers & Admission Cards',
    description: 'Generate physical printed student identity cards and official registration summaries for parents.',
    adminAccess: 'full',
    teacherAccess: 'full',
    adminCapabilities: ['Print Batch', 'Print Single'],
    teacherCapabilities: ['Print Single'],
    governanceRationale: 'Teachers need printable student profiles during parent-teacher consultative meetings.',
    enforcingComponent: 'EnrolmentManager.tsx (Learner Dossier Print)'
  },

  // 2. Fee Management & Finance
  {
    id: 'fees_overview',
    category: 'finance',
    categoryLabel: 'Finance & Tuition Fees',
    name: 'Access School Revenue & Collection Analytics',
    description: 'Inspect total billed tuition, banked cash collections, overall fee collection rates, and outstanding arrears.',
    adminAccess: 'full',
    teacherAccess: 'none',
    adminCapabilities: ['Full Financial Telemetry', 'Audit Reports'],
    teacherCapabilities: ['Restricted / Hidden Tab'],
    governanceRationale: 'School balance sheets, bank receipts, and financial health metrics remain strictly confidential to the Bursar and School Board.',
    enforcingComponent: 'FeeManager.tsx (Bursar Analytics)'
  },
  {
    id: 'fees_record_payment',
    category: 'finance',
    categoryLabel: 'Finance & Tuition Fees',
    name: 'Record Tuition Payments & Issue Official Receipts',
    description: 'Post M-Pesa paybill codes, bank deposit slips, or cash payments directly into a learner balance ledger.',
    adminAccess: 'full',
    teacherAccess: 'none',
    adminCapabilities: ['Post Payments', 'Generate Receipts', 'Audit Ledger'],
    teacherCapabilities: ['Restricted'],
    governanceRationale: 'Strict separation of fiduciary duties. Teaching staff must never handle money or verify bank deposits to prevent financial irregularities.',
    enforcingComponent: 'FeeManager.tsx (Record Payment modal)'
  },
  {
    id: 'fees_configure_packages',
    category: 'finance',
    categoryLabel: 'Finance & Tuition Fees',
    name: 'Configure Grade Tuition Packages & Special Levies',
    description: 'Set per-grade tuition amounts, science practical fees, mock exam levy fees, and activity charges.',
    adminAccess: 'full',
    teacherAccess: 'none',
    adminCapabilities: ['Create Packages', 'Update Tariffs'],
    teacherCapabilities: ['Restricted'],
    governanceRationale: 'Tuition fees are established exclusively by the PCEA Church Management Council and school administration.',
    enforcingComponent: 'FeeManager.tsx (Fee Structures)'
  },
  {
    id: 'fees_arrears_ledger',
    category: 'finance',
    categoryLabel: 'Finance & Tuition Fees',
    name: 'Inspect Individual Fee Balances & Arrears Lists',
    description: 'Filter students by fee clearance status (Cleared vs Unpaid) and download debt collection lists.',
    adminAccess: 'full',
    teacherAccess: 'none',
    adminCapabilities: ['Export Arrears', 'Issue Demand Notes'],
    teacherCapabilities: ['Restricted'],
    governanceRationale: 'Prevents bias or discrimination in classroom instruction based on individual family socioeconomic hardships.',
    enforcingComponent: 'FeeManager.tsx (Ledger Table)'
  },

  // 3. Academic Performance & Grading
  {
    id: 'grading_enter_scores',
    category: 'academics',
    categoryLabel: 'Academic Performance & Grading',
    name: 'Input Subject Examination Scores & Assignment Marks',
    description: 'Record marks (0-100), automated letter grade calculations, and continuous assessment tests.',
    adminAccess: 'full',
    teacherAccess: 'full',
    adminCapabilities: ['School-wide Entry', 'Override'],
    teacherCapabilities: ['Assigned Class & Subject Entry'],
    governanceRationale: 'Empowers subject teachers with classroom pedagogical autonomy while preserving administrative moderation authority.',
    enforcingComponent: 'GradingTracker.tsx'
  },
  {
    id: 'grading_pedagogical_remarks',
    category: 'academics',
    categoryLabel: 'Academic Performance & Grading',
    name: 'Write Pedagogical Teacher Comments & Feedback',
    description: 'Author qualitative commentary regarding learner cognitive growth, effort, strengths, and areas for improvement.',
    adminAccess: 'full',
    teacherAccess: 'full',
    adminCapabilities: ['Admin Moderation', 'Principal Remarks'],
    teacherCapabilities: ['Subject & Class Teacher Remarks'],
    governanceRationale: 'Essential for personalized educational assessment and constructive learner encouragement.',
    enforcingComponent: 'GradingTracker.tsx'
  },
  {
    id: 'grading_reopen_closed',
    category: 'academics',
    categoryLabel: 'Academic Performance & Grading',
    name: 'Unlock & Modify Historical / Closed Terminal Marks',
    description: 'Authorize grade modifications after end-term examination submission deadlines have passed.',
    adminAccess: 'full',
    teacherAccess: 'none',
    adminCapabilities: ['Unlock Gradebook', 'Audit Modification'],
    teacherCapabilities: ['Restricted'],
    governanceRationale: 'Prevents retroactive grade tampering once final results have been deliberated and sealed by the academic board.',
    enforcingComponent: 'GradingTracker.tsx (Lock / Save mechanism)'
  },

  // 4. Attendance Roll Call
  {
    id: 'attendance_daily_roll',
    category: 'attendance',
    categoryLabel: 'Attendance & Roll Call',
    name: 'Take Daily Morning Classroom Roll Call',
    description: 'Mark students as Present, Excused, or Absent with daily timestamps and absence notes.',
    adminAccess: 'full',
    teacherAccess: 'full',
    adminCapabilities: ['Any Class Register', 'Headmaster Oversight'],
    teacherCapabilities: ['Assigned Class Register'],
    governanceRationale: 'Class teachers conduct morning roll calls daily to maintain active student safety accountability.',
    enforcingComponent: 'AttendanceTracker.tsx'
  },
  {
    id: 'attendance_chronic_alerts',
    category: 'attendance',
    categoryLabel: 'Attendance & Roll Call',
    name: 'Monitor School-Wide Chronic Absenteeism Trends',
    description: 'Review multi-week statistical trends, identify high-risk attendance dropouts, and trigger welfare interventions.',
    adminAccess: 'full',
    teacherAccess: 'view',
    adminCapabilities: ['School-wide Interventions', 'MOE Escalation'],
    teacherCapabilities: ['Classroom View Only'],
    governanceRationale: 'Early detection of truancy and child protection risks requires centralized headmaster coordination.',
    enforcingComponent: 'DashboardOverview.tsx & AttendanceTracker.tsx'
  },
  {
    id: 'attendance_historical_audit',
    category: 'attendance',
    categoryLabel: 'Attendance & Roll Call',
    name: 'Alter Historical Attendance Logs (>7 Days Past)',
    description: 'Retroactively change student roll call statuses for dates older than one calendar week.',
    adminAccess: 'full',
    teacherAccess: 'none',
    adminCapabilities: ['Administrative Override', 'Audit Justification'],
    teacherCapabilities: ['Restricted'],
    governanceRationale: 'Complies with official Ministry of Education statutory roll call records integrity standards.',
    enforcingComponent: 'AttendanceTracker.tsx'
  },

  // 5. Timetable & Master Schedules
  {
    id: 'timetable_view',
    category: 'timetable',
    categoryLabel: 'Master Timetable & Scheduling',
    name: 'View Weekly Master Classroom & Teacher Timetables',
    description: 'Inspect period allocations from 08:00 to 15:45 across all streams, subjects, and classroom venues.',
    adminAccess: 'full',
    teacherAccess: 'full',
    adminCapabilities: ['School-wide View', 'Room Inspection'],
    teacherCapabilities: ['School-wide View', 'Personal Schedule'],
    governanceRationale: 'Enables teachers and substitute instructors to prepare lesson plans and locate teaching venues smoothly.',
    enforcingComponent: 'TimetableManager.tsx'
  },
  {
    id: 'timetable_edit_slots',
    category: 'timetable',
    categoryLabel: 'Master Timetable & Scheduling',
    name: 'Add, Reallocate, or Delete Master Class Periods',
    description: 'Assign subjects, allocate teacher workloads, and schedule lesson slots on the master timetable grid.',
    adminAccess: 'full',
    teacherAccess: 'none',
    adminCapabilities: ['Add Period', 'Remove Period', 'Reassign Venue'],
    teacherCapabilities: ['Restricted / View Only'],
    governanceRationale: 'Prevents scheduling conflicts, teacher double-booking, and uneven curriculum time allocations.',
    enforcingComponent: 'TimetableManager.tsx (Add Slot modal)'
  },

  // 6. Exam Paper Printing & Secretarial Locker
  {
    id: 'exams_submit_draft',
    category: 'exams',
    categoryLabel: 'Exam Paper Printing & Secretarial Locker',
    name: 'Submit Exam Drafts & Printing Requisitions',
    description: 'Upload exam question papers with copy quantities, two-sided specs, finishing requirements, and test dates.',
    adminAccess: 'full',
    teacherAccess: 'full',
    adminCapabilities: ['Submit Any Exam', 'Upload Mock Papers'],
    teacherCapabilities: ['Submit Subject Exams'],
    governanceRationale: 'Teachers author examination papers and requisition printing services for their students.',
    enforcingComponent: 'ExamPrintPortal.tsx (Requisition Form)'
  },
  {
    id: 'exams_approve_pipeline',
    category: 'exams',
    categoryLabel: 'Exam Paper Printing & Secretarial Locker',
    name: 'Approve Requisitions & Authorize Paper Reams',
    description: 'Review teacher requisitions, verify paper quotas, and advance orders into the active printing queue.',
    adminAccess: 'full',
    teacherAccess: 'none',
    adminCapabilities: ['Approve', 'Reject', 'Adjust Copy Counts'],
    teacherCapabilities: ['Restricted'],
    governanceRationale: 'Authorizes budget expenditures for toner cartridges, reams of paper, and ensures test format standards.',
    enforcingComponent: 'ExamPrintPortal.tsx (Status Pipeline)'
  },
  {
    id: 'exams_manage_press_queue',
    category: 'exams',
    categoryLabel: 'Exam Paper Printing & Secretarial Locker',
    name: 'Operate Print Press Queue & Assign Locker Security Codes',
    description: 'Mark exams as "On Printing Press" or "Ready in Locker", and generate confidential 4-digit pickup PINs.',
    adminAccess: 'full',
    teacherAccess: 'none',
    adminCapabilities: ['Run Press', 'Assign Secret Locker Codes'],
    teacherCapabilities: ['Restricted'],
    governanceRationale: 'Prevents exam leakage and paper theft by securing printed tests in locked secretarial vaults until exam morning.',
    enforcingComponent: 'ExamPrintPortal.tsx (Secretarial Controls)'
  },
  {
    id: 'exams_confidentiality',
    category: 'exams',
    categoryLabel: 'Exam Paper Printing & Secretarial Locker',
    name: 'Set Exam Security Level (Classified / Secure / Unrestricted)',
    description: 'Designate strict handling protocols for national standardized mock papers versus routine continuous quizzes.',
    adminAccess: 'full',
    teacherAccess: 'view',
    adminCapabilities: ['Set Security Protocol', 'Audit Handling'],
    teacherCapabilities: ['View Assigned Protocol'],
    governanceRationale: 'Protects the integrity and credibility of high-stakes summative assessment papers.',
    enforcingComponent: 'ExamPrintPortal.tsx'
  },

  // 7. Terminal Reports & Transcripts
  {
    id: 'reports_generate',
    category: 'reports',
    categoryLabel: 'Terminal Reports & Transcripts',
    name: 'Generate & View Official Terminal Report Cards',
    description: 'Compile marks, attendance rates, and teacher remarks into formal printable academic progress reports.',
    adminAccess: 'full',
    teacherAccess: 'full',
    adminCapabilities: ['All Classes & Streams', 'Batch Export'],
    teacherCapabilities: ['Assigned Class Learners'],
    governanceRationale: 'Core operational tool for reporting student achievement to parents at the conclusion of each academic term.',
    enforcingComponent: 'ReportCardsManager.tsx'
  },
  {
    id: 'reports_principal_seal',
    category: 'reports',
    categoryLabel: 'Terminal Reports & Transcripts',
    name: 'Certify Report Cards with Official Principal Seal & Signoff',
    description: 'Authorize institutional crest endorsement and append final remarks certifying official grade validity.',
    adminAccess: 'full',
    teacherAccess: 'none',
    adminCapabilities: ['Apply Seal', 'Official Sign-Off'],
    teacherCapabilities: ['Restricted (Form Teacher Remarks Only)'],
    governanceRationale: 'Only the School Headmaster has statutory authority to certify official institutional academic transcripts.',
    enforcingComponent: 'ReportCardsManager.tsx'
  },

  // 8. System Administration & Governance
  {
    id: 'system_user_impersonation',
    category: 'system',
    categoryLabel: 'System Administration & Security',
    name: 'Switch Active User Profiles & Audit Live Roles',
    description: 'Simulate or switch between Administrator and Teacher sessions for role validation and testing.',
    adminAccess: 'full',
    teacherAccess: 'none',
    adminCapabilities: ['Switch User', 'Simulate Any Profile'],
    teacherCapabilities: ['Restricted'],
    governanceRationale: 'Used by the system administrator to verify that sensitive modules remain locked for non-administrative roles.',
    enforcingComponent: 'Navbar.tsx (Role Switcher)'
  },
  {
    id: 'system_settings_inspect',
    category: 'system',
    categoryLabel: 'System Administration & Security',
    name: 'Manage System Settings & Permissions Matrix',
    description: 'Inspect live role privileges, feature allocations, and school operational configurations.',
    adminAccess: 'full',
    teacherAccess: 'view',
    adminCapabilities: ['Full Configuration & Audit'],
    teacherCapabilities: ['Read-Only Policy Transparency'],
    governanceRationale: 'Provides full transparency so teachers understand exact responsibilities while reserving governance authority to the Principal.',
    enforcingComponent: 'SystemSettingsManager.tsx'
  }
];

interface SystemSettingsManagerProps {
  currentUser: User;
  users: User[];
  onSwitchUser: (user: User) => void;
  userRole: UserRole;
  theme?: ThemeMode;
  resolvedTheme?: 'light' | 'dark';
  onThemeChange?: (mode: ThemeMode) => void;
}

export const SystemSettingsManager: React.FC<SystemSettingsManagerProps> = ({
  currentUser,
  users,
  onSwitchUser,
  userRole,
  theme = 'system',
  resolvedTheme = 'light',
  onThemeChange = (_mode: ThemeMode) => {}
}) => {
  const [activeTab, setActiveTab] = useState<'permissions' | 'appearance' | 'session' | 'audit'>('permissions');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'admin_only' | 'shared'>('all');
  const [selectedPermission, setSelectedPermission] = useState<FeaturePermission | null>(null);

  // Filtered permissions list
  const filteredPermissions = useMemo(() => {
    return PERMISSIONS_DATA.filter((perm) => {
      // Category filter
      if (categoryFilter !== 'all' && perm.category !== categoryFilter) {
        return false;
      }
      // Status filter
      if (statusFilter === 'admin_only' && perm.teacherAccess !== 'none') {
        return false;
      }
      if (statusFilter === 'shared' && perm.teacherAccess === 'none') {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = perm.name.toLowerCase().includes(q);
        const matchDesc = perm.description.toLowerCase().includes(q);
        const matchCat = perm.categoryLabel.toLowerCase().includes(q);
        const matchRationale = perm.governanceRationale.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCat && !matchRationale) {
          return false;
        }
      }
      return true;
    });
  }, [categoryFilter, statusFilter, searchQuery]);

  // Statistics
  const totalCount = PERMISSIONS_DATA.length;
  const adminEnabledCount = PERMISSIONS_DATA.filter((p) => p.adminAccess !== 'view').length;
  const teacherEnabledCount = PERMISSIONS_DATA.filter((p) => p.teacherAccess !== 'none').length;
  const adminOnlyCount = PERMISSIONS_DATA.filter((p) => p.teacherAccess === 'none').length;

  const categories = [
    { id: 'all', label: 'All Modules' },
    { id: 'admissions', label: 'Admissions & Roster' },
    { id: 'finance', label: 'Finance & Fees' },
    { id: 'academics', label: 'Grading & Marks' },
    { id: 'attendance', label: 'Attendance Roll' },
    { id: 'timetable', label: 'Timetable' },
    { id: 'exams', label: 'Exam Printing' },
    { id: 'reports', label: 'Terminal Reports' },
    { id: 'system', label: 'System & Security' }
  ];

  const handleSimulateRole = (targetRole: UserRole) => {
    const targetUser = users.find((u) => u.role === targetRole);
    if (targetUser) {
      onSwitchUser(targetUser);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-bold text-slate-900 font-serif">
              System Settings & Access Governance
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review school operational policies, RBAC privilege matrix, and security separation of duties between Teachers and Administrators.
          </p>
        </div>

        {/* Quick Role Simulation Control */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
            Active Role:
          </span>
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => handleSimulateRole('admin')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                userRole === 'admin'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin (Arthur)</span>
            </button>
            <button
              onClick={() => handleSimulateRole('teacher')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                userRole === 'teacher'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Teacher (Jane)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role Notice Banner if logged in as teacher */}
      {userRole === 'teacher' && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-3 animate-in fade-in">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-950">
              Viewing in Class Teacher Mode (Pedagogical Scope)
            </div>
            <p className="text-amber-800 leading-relaxed">
              You are currently logged in as a <strong>Class Teacher</strong>. The matrix below displays your active permissions (such as entering grades, taking morning roll call, and requesting exam printing) alongside features strictly reserved for the <strong>Headmaster & Bursar</strong> (such as tuition fees and master schedules).
            </p>
          </div>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold pb-px overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('permissions')}
          className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'permissions'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:border-slate-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Role Permissions Matrix</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-extrabold">
            {totalCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('appearance')}
          className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'appearance'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:border-slate-300'
          }`}
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="w-4 h-4 text-indigo-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          <span>Display & Low-Light Mode</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold capitalize">
            {theme === 'system' ? 'Auto' : resolvedTheme}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('session')}
          className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'session'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:border-slate-300'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>School Identity & Session</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'audit'
              ? 'border-orange-500 text-orange-600 dark:text-orange-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:border-slate-300'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Access Logs & Security Audit</span>
        </button>
      </div>

      {/* TAB 1: PERMISSIONS MATRIX VIEW */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          {/* Key Metric Cards Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Capabilities</span>
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2 font-sans">{totalCount}</div>
              <p className="text-[11px] text-slate-500 mt-1">Regulated operational actions</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-orange-200/60 bg-gradient-to-br from-white to-orange-50/30 shadow-xs">
              <div className="flex items-center justify-between text-orange-600">
                <span className="text-[10px] font-bold uppercase tracking-wider">Admin Clearance</span>
                <ShieldCheck className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-2xl font-black text-orange-600 mt-2 font-sans">
                {totalCount} / {totalCount}
              </div>
              <p className="text-[11px] text-orange-700/80 mt-1">100% Full administrative access</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-blue-200/60 bg-gradient-to-br from-white to-blue-50/30 shadow-xs">
              <div className="flex items-center justify-between text-blue-600">
                <span className="text-[10px] font-bold uppercase tracking-wider">Teacher Scope</span>
                <UserCheck className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2 font-sans">
                {teacherEnabledCount} <span className="text-xs font-semibold text-slate-400">/ {totalCount}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Pedagogical & roll call tasks</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-rose-200/60 bg-gradient-to-br from-white to-rose-50/30 shadow-xs">
              <div className="flex items-center justify-between text-rose-600">
                <span className="text-[10px] font-bold uppercase tracking-wider">Admin Protected</span>
                <Lock className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-rose-600 mt-2 font-sans">
                {adminOnlyCount} <span className="text-xs font-semibold text-rose-400">Actions</span>
              </div>
              <p className="text-[11px] text-rose-700/80 mt-1">Fiduciary & timetable control</p>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search capability, module, or security rationale..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <span className="text-[11px] text-slate-400 uppercase font-bold mr-1">Filter:</span>
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({totalCount})
                </button>
                <button
                  onClick={() => setStatusFilter('shared')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    statusFilter === 'shared'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  Enabled for Teachers ({teacherEnabledCount})
                </button>
                <button
                  onClick={() => setStatusFilter('admin_only')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    statusFilter === 'admin_only'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                  }`}
                >
                  Admin Only ({adminOnlyCount})
                </button>
              </div>
            </div>

            {/* Category Module Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Modules:</span>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-orange-500 text-white font-bold shadow-2xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feature Permissions Matrix Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-3 px-4 min-w-[240px] md:min-w-[280px]">Feature & Capability</th>
                    <th className="py-3 px-4 w-40 text-center bg-orange-50/40 border-x border-slate-200/80">
                      <div className="flex items-center justify-center gap-1.5 text-orange-950 font-black">
                        <ShieldCheck className="w-4 h-4 text-orange-600" />
                        <span>Administrator</span>
                      </div>
                      <div className="text-[10px] text-orange-600 normal-case font-medium">Principal & Bursar</div>
                    </th>
                    <th className="py-3 px-4 w-40 text-center border-r border-slate-200/80">
                      <div className="flex items-center justify-center gap-1.5 text-slate-900 font-black">
                        <UserCheck className="w-4 h-4 text-slate-700" />
                        <span>Class Teacher</span>
                      </div>
                      <div className="text-[10px] text-slate-500 normal-case font-medium">Instruction Staff</div>
                    </th>
                    <th className="py-3 px-4 min-w-[220px]">Separation of Duty / Governance Rationale</th>
                    <th className="py-3 px-4 w-20 text-center">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPermissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        <SlidersHorizontal className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-600">No capabilities match your filter</p>
                        <p className="text-xs text-slate-400 mt-1">Try selecting a different module or clearing the search query.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPermissions.map((perm) => {
                      const isTeacherEnabled = perm.teacherAccess !== 'none';
                      return (
                        <tr
                          key={perm.id}
                          className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                          onClick={() => setSelectedPermission(perm)}
                        >
                          {/* Feature Description */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors flex items-center gap-2">
                              <span>{perm.name}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{perm.description}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
                                {perm.categoryLabel}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                                {perm.enforcingComponent}
                              </span>
                            </div>
                          </td>

                          {/* Admin Access Badge */}
                          <td className="py-3.5 px-4 text-center bg-orange-50/10 border-x border-slate-100">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200/80 shadow-2xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Enabled</span>
                            </span>
                            <div className="text-[10px] text-slate-500 font-medium mt-1">Full Control</div>
                          </td>

                          {/* Teacher Access Badge */}
                          <td className="py-3.5 px-4 text-center border-r border-slate-100">
                            {isTeacherEnabled ? (
                              <div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200/80 shadow-2xs">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Enabled</span>
                                </span>
                                <div className="text-[10px] text-slate-500 font-medium mt-1">
                                  {perm.teacherAccess === 'view' ? 'View Only' : 'Pedagogical Scope'}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Restricted</span>
                                </span>
                                <div className="text-[10px] text-rose-600 font-bold mt-1">Admin Only</div>
                              </div>
                            )}
                          </td>

                          {/* Governance Rationale */}
                          <td className="py-3.5 px-4 text-slate-600 text-[11px] leading-relaxed">
                            <p className="line-clamp-2">{perm.governanceRationale}</p>
                          </td>

                          {/* Action Details */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPermission(perm);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-500 transition-colors cursor-pointer"
                              title="Inspect full feature permissions and implementation details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: DISPLAY & LOW-LIGHT NIGHT MODE */}
      {activeTab === 'appearance' && (
        <div className="space-y-6 max-w-4xl">
          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-serif flex items-center gap-2">
                  <span>Display Theme & Night Shift</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80">
                    Low-Light Ready
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                  Adjust color contrast for high daylight visibility in sunny classrooms or soft, low-glare dark mode for teachers recording marks and reviewing exams after hours.
                </p>
              </div>

              {/* Segmented Control */}
              <ThemeSwitcher
                theme={theme}
                resolvedTheme={resolvedTheme}
                onThemeChange={onThemeChange}
                variant="segmented"
              />
            </div>

            {/* Quick Status Pill */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    resolvedTheme === 'dark'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  }`}
                >
                  {resolvedTheme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    Active Render Engine: {resolvedTheme === 'dark' ? 'Low-Light Dark Palette' : 'Daylight High-Contrast Palette'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Mode configured as: <strong className="capitalize text-orange-600 dark:text-orange-400">{theme}</strong>
                    {theme === 'system' && ' (matches your operating system clock & preferences)'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Quick key:</span>
                <kbd className="px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-2xs">
                  Shift + D
                </kbd>
              </div>
            </div>

            {/* 3 Mode Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => onThemeChange('light')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-orange-50/60 dark:bg-orange-950/20 border-orange-500/80 ring-2 ring-orange-400/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-750 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                    <Sun className="w-4 h-4" />
                  </div>
                  {theme === 'light' && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-500 text-white">
                      Selected
                    </span>
                  )}
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Light Daylight Mode</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Clean, paper-white backgrounds engineered for brightly lit classrooms and checking document print layouts before press release.
                </p>
              </div>

              <div
                onClick={() => onThemeChange('dark')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-orange-50/60 dark:bg-orange-950/20 border-orange-500/80 ring-2 ring-orange-400/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-750 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <Moon className="w-4 h-4" />
                  </div>
                  {theme === 'dark' && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-500 text-white">
                      Selected
                    </span>
                  )}
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Dark Night Mode</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Deep slate low-light contrast. Reduces eye fatigue and screen glare for teachers grading student exams and compiling terminal reports in the evening.
                </p>
              </div>

              <div
                onClick={() => onThemeChange('system')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'bg-orange-50/60 dark:bg-orange-950/20 border-orange-500/80 ring-2 ring-orange-400/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-750 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold">
                    <Monitor className="w-4 h-4" />
                  </div>
                  {theme === 'system' && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-500 text-white">
                      Selected
                    </span>
                  )}
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-slate-100">System Auto Sync</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Automatically adapts to your laptop, tablet, or phone OS schedule — switching to light by day and night shift after sunset.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCHOOL IDENTITY & SESSION */}
      {activeTab === 'session' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs max-w-4xl space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-serif">
                Institutional Profile & Active Academic Session
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                School identification parameters and academic session details configured in the system.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">School Legal Name</span>
                <div className="text-sm font-bold text-slate-900">PCEA St Andrews Kindergarten</div>
                <p className="text-[11px] text-slate-500">Ministry of Education Reg No: MOE/PS/04128</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Campus Location</span>
                <div className="text-sm font-bold text-slate-900">State House Road, Nairobi</div>
                <p className="text-[11px] text-slate-500">P.O. Box 41282-00100 Nairobi • Tel: +254 20 272 3505</p>
              </div>

              <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-200/70 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700">Active Academic Session</span>
                <div className="text-sm font-bold text-orange-950 flex items-center gap-2">
                  <span>Term 1 — 2026 Academic Year</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-orange-800">Session dates: January 6, 2026 – April 10, 2026</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sponsoring Authority</span>
                <div className="text-sm font-bold text-slate-900">Presbyterian Church of East Africa</div>
                <p className="text-[11px] text-slate-500">St Andrews Parish Session & School Management Committee</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Registered Institutional User Accounts
              </h3>
              <div className="space-y-2">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                          u.role === 'admin' ? 'bg-orange-500' : 'bg-slate-800'
                        }`}
                      >
                        {u.role === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-500">{u.title} • {u.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {u.role === 'admin' ? 'Administrator (Full Access)' : 'Class Teacher (Pedagogical)'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACCESS LOGS & SECURITY AUDIT */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs max-w-4xl space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-serif">
                Security Audit Log & Privilege Enforcement
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verifies that strict separation of fiduciary and pedagogical duties is enforced continuously.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Tuition Fee Ledger Isolation Verified</span>
                    <span className="text-[10px] text-slate-400 font-mono">Today, 08:30 AM</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Verified that fee collection routes and arrears exports are restricted strictly to Dr. Arthur Pendelton (Administrator). Teaching staff accounts successfully blocked from bank ledger access.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Exam Paper Requisition Queue Authorized</span>
                    <span className="text-[10px] text-slate-400 font-mono">Yesterday, 14:15 PM</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Teacher Jane Mwangi uploaded Chemistry End-Term draft. Secretarial Print Room lock assigned to Locker #03; code issued exclusively via Administrator authorization.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Daily Attendance Roll Call Logged</span>
                    <span className="text-[10px] text-slate-400 font-mono">Yesterday, 08:10 AM</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Grade 10-A morning register recorded by Teacher Jane Mwangi. Headmaster dashboard synchronized with zero attendance roll tampering detected.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Learner Admission Certificate Generated</span>
                    <span className="text-[10px] text-slate-400 font-mono">Sep 14, 2026</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    New learner admission for ADM-2026-088 registered under Administrator clearance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL FOR INSPECTING A PERMISSION */}
      {selectedPermission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4 text-xs">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                  {selectedPermission.categoryLabel}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5 font-serif">
                  {selectedPermission.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPermission(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-slate-600 leading-relaxed">{selectedPermission.description}</p>

            {/* Roles Comparison Box */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-orange-950 font-bold">
                  <ShieldCheck className="w-4 h-4 text-orange-600" />
                  <span>Administrator</span>
                </div>
                <div className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                  Full Access
                </div>
                <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                  {selectedPermission.adminCapabilities.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5 border-l border-slate-200 pl-3">
                <div className="flex items-center gap-1 text-slate-900 font-bold">
                  <UserCheck className="w-4 h-4 text-slate-700" />
                  <span>Class Teacher</span>
                </div>
                <div
                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    selectedPermission.teacherAccess !== 'none'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {selectedPermission.teacherAccess !== 'none' ? 'Permitted' : 'Restricted (Admin Only)'}
                </div>
                <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                  {selectedPermission.teacherCapabilities.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Separation of Duty Governance Rationale */}
            <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200/80 space-y-1">
              <div className="text-[11px] font-bold text-orange-950 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-orange-600" />
                <span>Governance & Educational Standard Rationale</span>
              </div>
              <p className="text-orange-900 text-[11px] leading-relaxed">
                {selectedPermission.governanceRationale}
              </p>
            </div>

            {/* Implementation code anchor */}
            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
              <span>Enforcing Code Component:</span>
              <span className="font-mono text-slate-700 font-semibold">{selectedPermission.enforcingComponent}</span>
            </div>

            {/* Close Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPermission(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
