import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  HeartPulse,
  CreditCard,
  Calendar,
  CheckCircle2,
  X,
  FileSpreadsheet,
  AlertCircle
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
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {student.admissionNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                            {student.firstName[0]}
                            {student.lastName[0]}
                          </div>
                          <div>
                            <div>
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {student.gender} • DOB: {student.dateOfBirth}
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
                            onClick={() => setSelectedStudent(student)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
                          >
                            Profile
                          </button>
                          <button
                            onClick={() => onViewReportCard(student)}
                            className="px-2 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium text-xs transition-colors cursor-pointer border border-orange-200/60"
                            title="Generate Term Report Card"
                          >
                            Report Card
                          </button>
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

      {/* Student Profile Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                  {selectedStudent.firstName[0]}
                  {selectedStudent.lastName[0]}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedStudent.admissionNumber} • {selectedStudent.grade} ({selectedStudent.stream})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Enrolment Information
                </span>
                <p className="text-slate-700 font-medium">Gender: {selectedStudent.gender}</p>
                <p className="text-slate-700 font-medium">Date of Birth: {selectedStudent.dateOfBirth}</p>
                <p className="text-slate-700 font-medium">Date Admitted: {selectedStudent.enrollmentDate}</p>
                <p className="text-slate-700 font-medium capitalize">Status: {selectedStudent.status}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Parent / Guardian Details
                </span>
                <p className="text-slate-900 font-bold">
                  {selectedStudent.guardianName} ({selectedStudent.guardianRelationship})
                </p>
                <p className="text-slate-600 flex items-center gap-1.5 mt-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {selectedStudent.guardianPhone}
                </p>
                {selectedStudent.guardianEmail && (
                  <p className="text-slate-600 flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {selectedStudent.guardianEmail}
                  </p>
                )}
                <p className="text-slate-600 mt-1">Residence: {selectedStudent.address}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Health & Medical Alerts
                </span>
                <div className="flex items-start gap-2 text-rose-700 font-medium">
                  <HeartPulse className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{selectedStudent.medicalNotes || 'No known health alerts'}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  School Fee Account
                </span>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Billed:</span>
                    <span className="font-semibold text-slate-900">
                      KES {selectedStudent.totalFeesBilled.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Paid:</span>
                    <span className="font-semibold text-emerald-700">
                      KES {selectedStudent.totalFeesPaid.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-700 font-bold">Outstanding Balance:</span>
                    <span
                      className={`font-black ${
                        selectedStudent.feeBalance === 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      KES {selectedStudent.feeBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  onViewReportCard(selectedStudent);
                  setSelectedStudent(null);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Open Term Report Card</span>
              </button>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
              >
                Close
              </button>
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
                  Admit New Learner to Edura Academy
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
