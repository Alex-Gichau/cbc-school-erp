import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  PhoneCall,
  Mail,
  HeartPulse,
  CreditCard,
  Calendar,
  CheckCircle2,
  X,
  FileSpreadsheet,
  AlertCircle,
  Copy,
  Check,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Printer,
  BookOpen,
  Activity,
  Clock,
  Sparkles
} from 'lucide-react';
import { Student, UserRole } from '../types';

interface EnrolmentManagerProps {
  students: Student[];
  onAddStudent: (student: Partial<Student>) => Promise<void>;
  userRole: UserRole;
  onViewReportCard: (student: Student) => void;
}

export const EnrolmentManager: React.FC<EnrolmentManagerProps> = ({
  students,
  onAddStudent,
  userRole,
  onViewReportCard
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Helper to calculate age from birth date
  const calculateAge = (dobString: string): string => {
    if (!dobString) return 'N/A';
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return 'N/A';
    const today = new Date('2026-09-15');
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} years old`;
  };

  const handleCopyText = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const handleCopyFullDossier = (student: Student) => {
    const text = `PCEA ST ANDREWS KINDERGARTEN - OFFICIAL LEARNER DOSSIER
=====================================================
Learner: ${student.firstName} ${student.lastName}
Admission No: ${student.admissionNumber}
Grade & Stream: ${student.grade} (${student.stream} Stream)
Gender: ${student.gender}
Date of Birth: ${student.dateOfBirth} (${calculateAge(student.dateOfBirth)})
Date Admitted: ${student.enrollmentDate}
Enrolment Status: ${student.status.toUpperCase()}

GUARDIAN & EMERGENCY CONTACTS:
Guardian: ${student.guardianName} (${student.guardianRelationship})
Telephone: ${student.guardianPhone}
Email: ${student.guardianEmail || 'None'}
Emergency Contact: ${student.emergencyContact || student.guardianPhone}
Address: ${student.address}

MEDICAL & HEALTH ALERTS:
${student.medicalNotes || 'No known allergies or medical restrictions registered.'}

FINANCIAL & FEE LEDGER:
Total Fees Billed: KES ${student.totalFeesBilled.toLocaleString()}
Total Fees Paid: KES ${student.totalFeesPaid.toLocaleString()}
Outstanding Arrears: KES ${student.feeBalance.toLocaleString()}
Fee Standing: ${student.feeBalance === 0 ? 'CLEARED' : 'PENDING PAYMENT'}

ATTENDANCE:
Cumulative Rate: ${student.attendancePercentage}%
=====================================================`;

    handleCopyText(text, 'Full Dossier');
  };

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    admissionNumber: `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    dateOfBirth: '2009-05-15',
    grade: 'Grade 10-A',
    stream: 'Alpha',
    guardianName: '',
    guardianRelationship: 'Mother',
    guardianPhone: '+254 ',
    guardianEmail: '',
    address: 'Nairobi',
    emergencyContact: '',
    medicalNotes: 'None'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.guardianName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGrade = selectedGrade === 'all' || student.grade.toLowerCase() === selectedGrade.toLowerCase();
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;

    return matchesSearch && matchesGrade && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.guardianName.trim()) {
      setFormError('Please fill in the learner name and guardian contact details.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');
      await onAddStudent(formData);
      setShowAddModal(false);
      // reset form
      setFormData({
        firstName: '',
        lastName: '',
        admissionNumber: `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        gender: 'Male',
        dateOfBirth: '2009-05-15',
        grade: 'Grade 10-A',
        stream: 'Alpha',
        guardianName: '',
        guardianRelationship: 'Mother',
        guardianPhone: '+254 ',
        guardianEmail: '',
        address: 'Nairobi',
        emergencyContact: '',
        medicalNotes: 'None'
      });
    } catch (err: any) {
      setFormError(err.message || 'Failed to register learner');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-bold text-slate-900 font-serif">
              Learner Enrolment & Student Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete student admission records, contact details, medical information, and academic placement.
          </p>
        </div>

        {userRole === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/15 transition-all shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Admit New Learner</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search learner name, ADM number, parent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Class:</span>
          </div>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
          >
            <option value="all">All Classes</option>
            <option value="Grade 9-A">Grade 9-A</option>
            <option value="Grade 9-B">Grade 9-B</option>
            <option value="Grade 10-A">Grade 10-A</option>
            <option value="Grade 10-B">Grade 10-B</option>
            <option value="Grade 11-A">Grade 11-A</option>
            <option value="Grade 12-A">Grade 12-A</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="transferred">Transferred</option>
            <option value="graduated">Graduated</option>
          </select>

          <span className="text-xs text-slate-400 font-medium pl-2">
            Showing {filteredStudents.length} of {students.length}
          </span>
        </div>
      </div>

      {/* Student Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Tip / Instruction Banner */}
        <div className="px-4 py-2.5 bg-orange-50/70 border-b border-orange-200/60 flex items-center justify-between text-xs text-orange-950 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shrink-0" />
            <span>
              Tip: <strong>Click any table row</strong> to open the complete learner dossier, guardian contacts & medical details.
            </span>
          </div>
          <span className="text-[11px] text-orange-800 font-bold shrink-0 hidden sm:inline">
            Showing {filteredStudents.length} of {students.length} Learners
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Admission No.</th>
                <th className="py-3.5 px-4">Learner Name</th>
                <th className="py-3.5 px-4">Grade & Stream</th>
                <th className="py-3.5 px-4">Guardian Contact</th>
                <th className="py-3.5 px-4">Attendance</th>
                <th className="py-3.5 px-4">Fee Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No learners match the current search or class filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isCleared = student.feeBalance === 0;
                  return (
                    <tr
                      key={student.id}
                      id={`learner-row-${student.id}`}
                      onClick={() => setSelectedStudent(student)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedStudent(student);
                        }
                      }}
                      className="hover:bg-orange-50/50 cursor-pointer transition-colors group select-none"
                      title={`Click to open full learner details for ${student.firstName} ${student.lastName}`}
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        <span className="group-hover:text-orange-600 transition-colors font-bold">
                          {student.admissionNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center font-bold text-xs border border-orange-200/60 group-hover:scale-105 transition-transform shrink-0">
                            {student.firstName[0]}
                            {student.lastName[0]}
                          </div>
                          <div>
                            <div className="group-hover:text-orange-600 transition-colors font-bold">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {student.gender} • {calculateAge(student.dateOfBirth)} (DOB: {student.dateOfBirth})
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 font-bold text-[11px] border border-orange-200/60">
                          {student.grade}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Stream: {student.stream}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">{student.guardianName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {student.guardianPhone}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-bold ${
                              student.attendancePercentage >= 95
                                ? 'text-emerald-700'
                                : student.attendancePercentage >= 85
                                ? 'text-amber-700'
                                : 'text-rose-700'
                            }`}
                          >
                            {student.attendancePercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {isCleared ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Cleared
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            KES {student.feeBalance.toLocaleString()} Due
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`view-details-${student.id}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudent(student);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-orange-50 group-hover:bg-orange-100 text-orange-700 font-bold text-xs transition-colors cursor-pointer border border-orange-200/70"
                          >
                            Details
                          </button>
                          <button
                            id={`report-card-${student.id}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewReportCard(student);
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
                            title="Generate Term Report Card"
                          >
                            Report Card
                          </button>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Learner Details Dossier Modal */}
      {selectedStudent && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            id="learner-details-modal"
            className="bg-white rounded-3xl max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Modal Header */}
            <div className="flex items-start justify-between pb-5 border-b border-slate-100 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-orange-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-orange-500/20 ring-2 ring-orange-400/30 shrink-0">
                  {selectedStudent.firstName[0]}
                  {selectedStudent.lastName[0]}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 font-serif">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        selectedStudent.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : selectedStudent.status === 'transferred'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {selectedStudent.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                    <span className="font-mono font-bold text-slate-700 flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-md">
                      {selectedStudent.admissionNumber}
                      <button
                        type="button"
                        onClick={() => handleCopyText(selectedStudent.admissionNumber, 'Admission Number')}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Copy Admission Number"
                      >
                        {copiedField === 'Admission Number' ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-orange-600">
                      {selectedStudent.grade} ({selectedStudent.stream} Stream)
                    </span>
                    <span>•</span>
                    <span>Enrolled: {selectedStudent.enrollmentDate}</span>
                  </div>
                </div>
              </div>

              <button
                id="close-learner-details-btn"
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick KPI Metric Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-200/70">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-700 block mb-0.5">
                  Class Placement
                </span>
                <div className="text-sm font-bold text-slate-900">{selectedStudent.grade}</div>
                <div className="text-[11px] text-orange-800 mt-0.5 font-medium">{selectedStudent.stream} Stream</div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/70">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block mb-0.5">
                  Attendance Record
                </span>
                <div className="text-sm font-black text-emerald-800">{selectedStudent.attendancePercentage}%</div>
                <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">
                  {selectedStudent.attendancePercentage >= 95 ? 'Exceptional Attendance' : 'Regular Attendance'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-0.5">
                  Fee Status
                </span>
                <div
                  className={`text-sm font-bold ${
                    selectedStudent.feeBalance === 0 ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {selectedStudent.feeBalance === 0
                    ? 'Fully Cleared'
                    : `KES ${selectedStudent.feeBalance.toLocaleString()} Due`}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  {Math.round((selectedStudent.totalFeesPaid / (selectedStudent.totalFeesBilled || 1)) * 100)}% Paid
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-0.5">
                  Age & Birthday
                </span>
                <div className="text-sm font-bold text-slate-900">{calculateAge(selectedStudent.dateOfBirth)}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-medium">DOB: {selectedStudent.dateOfBirth}</div>
              </div>
            </div>

            {/* Detailed Comprehensive Information Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-xs">
              {/* 1. Complete Biodata & Enrolment Information */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-orange-500" />
                    Personal & Admission Biodata
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">ID: {selectedStudent.id}</span>
                </div>

                <div className="space-y-1.5 text-slate-700">
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500 font-medium">Full Name:</span>
                    <span className="font-bold text-slate-900">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500 font-medium">Admission No.:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedStudent.admissionNumber}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500 font-medium">Gender:</span>
                    <span className="font-semibold text-slate-900">{selectedStudent.gender}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500 font-medium">Date of Birth:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedStudent.dateOfBirth} ({calculateAge(selectedStudent.dateOfBirth)})
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500 font-medium">Enrolment Date:</span>
                    <span className="font-semibold text-slate-900">{selectedStudent.enrollmentDate}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500 font-medium">Academic Year:</span>
                    <span className="font-semibold text-slate-900">2026 AY • Term 1</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500 font-medium">Enrolment Status:</span>
                    <span className="capitalize font-bold text-emerald-700">{selectedStudent.status}</span>
                  </div>
                </div>
              </div>

              {/* 2. Parent / Guardian & Emergency Contacts */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-orange-500" />
                    Parent / Guardian & Contacts
                  </span>
                  <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200/50">
                    Primary Contact
                  </span>
                </div>

                <div className="space-y-2 text-slate-700">
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase">Primary Guardian</div>
                    <div className="font-bold text-slate-900 text-sm">
                      {selectedStudent.guardianName}{' '}
                      <span className="text-xs font-normal text-slate-500">
                        ({selectedStudent.guardianRelationship})
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1">
                    <div className="flex items-center justify-between py-1 px-2.5 rounded-xl bg-white border border-slate-200/60">
                      <span className="text-slate-500 font-medium flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        Telephone:
                      </span>
                      <a
                        href={`tel:${selectedStudent.guardianPhone}`}
                        className="font-mono font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1"
                        title="Click to call guardian"
                      >
                        {selectedStudent.guardianPhone}
                        <PhoneCall className="w-3 h-3" />
                      </a>
                    </div>

                    {selectedStudent.guardianEmail && (
                      <div className="flex items-center justify-between py-1 px-2.5 rounded-xl bg-white border border-slate-200/60">
                        <span className="text-slate-500 font-medium flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          Email:
                        </span>
                        <a
                          href={`mailto:${selectedStudent.guardianEmail}`}
                          className="font-medium text-slate-800 hover:text-orange-600 hover:underline truncate max-w-[180px]"
                          title="Click to email parent"
                        >
                          {selectedStudent.guardianEmail}
                        </a>
                      </div>
                    )}

                    <div className="flex items-center justify-between py-1 px-2.5 rounded-xl bg-rose-50/60 border border-rose-200/60 text-rose-900">
                      <span className="font-semibold flex items-center gap-1.5 text-rose-800">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                        Emergency Contact:
                      </span>
                      <a
                        href={`tel:${selectedStudent.emergencyContact || selectedStudent.guardianPhone}`}
                        className="font-mono font-bold text-rose-700 hover:underline"
                      >
                        {selectedStudent.emergencyContact || selectedStudent.guardianPhone}
                      </a>
                    </div>

                    <div className="flex items-start gap-2 pt-1 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-700">Home Residence:</strong> {selectedStudent.address}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Academic Placement & Curriculum Subjects */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-orange-500" />
                    Academic Placement & Faculty
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">Term 1, 2026</span>
                </div>

                <div className="space-y-2 text-slate-700">
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500 font-medium">Assigned Class:</span>
                    <span className="font-bold text-slate-900">{selectedStudent.grade}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500 font-medium">Class Stream:</span>
                    <span className="font-semibold text-slate-900">{selectedStudent.stream} Stream</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500 font-medium">Campus:</span>
                    <span className="font-semibold text-slate-900">PCEA St Andrews Campus</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500 font-medium">Faculty Advisors:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedStudent.grade.includes('10')
                        ? 'Sarah Jenkins & Dr. Helen Oloo'
                        : selectedStudent.grade.includes('9')
                        ? 'Claire Kamau & Marcus Vance'
                        : 'Faculty Board Members'}
                    </span>
                  </div>

                  <div className="pt-1.5 border-t border-slate-200/60">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Enrolled Core Curriculum Subjects
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'English Literature',
                        'Mathematics',
                        'Integrated Sciences',
                        'Social Studies',
                        'Creative Arts',
                        'Physical Education'
                      ].map((sub) => (
                        <span
                          key={sub}
                          className="px-2 py-0.5 bg-white border border-slate-200/80 rounded-md text-[10px] font-medium text-slate-700"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Health, Medical & Dietary Alerts */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                    Health & Medical Profile
                  </span>
                  <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/50">
                    School Nurse Protocol
                  </span>
                </div>

                <div className="space-y-2.5 text-slate-700">
                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-start gap-2.5">
                    <HeartPulse className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Medical Conditions & Allergies</div>
                      <p className="text-slate-600 mt-0.5 text-xs">
                        {selectedStudent.medicalNotes && selectedStudent.medicalNotes !== 'None'
                          ? selectedStudent.medicalNotes
                          : 'No known chronic medical conditions, allergies, or dietary restrictions registered.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-amber-900 text-[11px]">
                    <span className="font-bold">First Aid Protocol:</span> Certified school health staff on site during
                    all teaching hours. In emergency circumstances, guardian will be immediately phoned followed by
                    the school physician.
                  </div>
                </div>
              </div>

              {/* 5. School Fee Account & Financial Ledger */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-orange-500" />
                    School Fee Account & Ledger
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      selectedStudent.feeBalance === 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selectedStudent.feeBalance === 0 ? 'Full Clearance' : 'Pending Arrears'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500 font-medium">Total Fees Billed (Term 1):</span>
                    <span className="font-semibold text-slate-900">
                      KES {selectedStudent.totalFeesBilled.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500 font-medium">Total Fees Paid to Date:</span>
                    <span className="font-bold text-emerald-700">
                      KES {selectedStudent.totalFeesPaid.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-slate-200">
                    <span className="text-slate-800 font-bold">Outstanding Balance:</span>
                    <span
                      className={`font-black text-sm ${
                        selectedStudent.feeBalance === 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      KES {selectedStudent.feeBalance.toLocaleString()}
                    </span>
                  </div>

                  {/* Payment Progress Bar */}
                  <div className="pt-1">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Payment Progress</span>
                      <span className="font-bold">
                        {Math.min(
                          100,
                          Math.round((selectedStudent.totalFeesPaid / (selectedStudent.totalFeesBilled || 1)) * 100)
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          selectedStudent.feeBalance === 0 ? 'bg-emerald-500' : 'bg-orange-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((selectedStudent.totalFeesPaid / (selectedStudent.totalFeesBilled || 1)) * 100)
                          )}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Attendance Analytics & Roll Call Standing */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    Attendance & Roll Call Pulse
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50">
                    90 Days Rolling
                  </span>
                </div>

                <div className="space-y-2 text-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Cumulative Attendance Rate:</span>
                    <span className="text-base font-black text-emerald-700">
                      {selectedStudent.attendancePercentage}%
                    </span>
                  </div>

                  {/* Attendance Bar */}
                  <div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${selectedStudent.attendancePercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs">
                    <div className="font-bold text-slate-800">
                      {selectedStudent.attendancePercentage >= 95
                        ? 'Exemplary Attendance & Regularity'
                        : selectedStudent.attendancePercentage >= 85
                        ? 'Satisfactory Attendance Standing'
                        : 'Attendance Review Recommended'}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Learner is actively registered in the daily morning roll call register with verified parent notification.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Modal Actions Bar */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleCopyFullDossier(selectedStudent)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer w-full sm:w-auto"
                  title="Copy formatted learner record to clipboard"
                >
                  {copiedField === 'Full Dossier' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Dossier Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Full Record</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer w-full sm:w-auto"
                  title="Print learner dossier slip"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  id="open-report-card-from-modal-btn"
                  type="button"
                  onClick={() => {
                    onViewReportCard(selectedStudent);
                    setSelectedStudent(null);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors shadow-md shadow-orange-500/20 cursor-pointer w-full sm:w-auto"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Open Term Report Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer w-full sm:w-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Learner Admission Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-serif">
                  Admit New Learner to PCEA St Andrews Kindergarten
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Creates permanent student profile, registers parent contact, and allocates class.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-2">
                  1. Learner Biodata
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Samuel"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Last / Surname *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Waweru"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Admission Number</label>
                    <input
                      type="text"
                      value={formData.admissionNumber}
                      onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Assigned Grade</label>
                    <select
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold"
                    >
                      <option value="Grade 9-A">Grade 9-A</option>
                      <option value="Grade 9-B">Grade 9-B</option>
                      <option value="Grade 10-A">Grade 10-A</option>
                      <option value="Grade 10-B">Grade 10-B</option>
                      <option value="Grade 11-A">Grade 11-A</option>
                      <option value="Grade 12-A">Grade 12-A</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-2">
                  2. Parent / Guardian Contacts
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Guardian Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mary Waweru"
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Relationship</label>
                    <input
                      type="text"
                      placeholder="Mother / Father / Uncle"
                      value={formData.guardianRelationship}
                      onChange={(e) => setFormData({ ...formData, guardianRelationship: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Telephone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+254 7..."
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="parent@example.com"
                      value={formData.guardianEmail}
                      onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 mb-1">Home Residential Address</label>
                    <input
                      type="text"
                      placeholder="Estate, Road, House No."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-2">
                  3. Health & Medical Information
                </span>
                <div>
                  <label className="block text-slate-600 mb-1">Medical Conditions, Allergies, or Dietary Needs</label>
                  <input
                    type="text"
                    placeholder="e.g. Asthma (carries inhaler), Penicillin allergy, or None"
                    value={formData.medicalNotes}
                    onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
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
                  {isSubmitting ? 'Registering Learner...' : 'Complete Enrolment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
