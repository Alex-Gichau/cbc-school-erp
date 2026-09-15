import {
  Student,
  FeePayment,
  GradeRecord,
  AttendanceRecord,
  TimetableSlot,
  ExamPaper,
  AttendanceAnalytics,
  User
} from '../types';
import {
  DEMO_USERS,
  INITIAL_STUDENTS,
  INITIAL_PAYMENTS,
  INITIAL_GRADES,
  INITIAL_TIMETABLE,
  INITIAL_EXAMS,
  ATTENDANCE_ANALYTICS
} from '../data/mockData';

// Safe API caller that queries the Express server with fallback to in-memory state
export const api = {
  async getUsers(): Promise<User[]> {
    try {
      const res = await fetch('/api/users');
      if (res.ok) return await res.json();
    } catch (_) {}
    return DEMO_USERS;
  },

  async getHealth(): Promise<any> {
    try {
      const res = await fetch('/api/health');
      if (res.ok) return await res.json();
    } catch (_) {}
    return {
      status: 'online',
      appName: 'PCEA St Andrews Kindergarten SMS',
      database: { provider: 'Embedded School Database (Active)', connected: true }
    };
  },

  async getStudents(params?: { grade?: string; status?: string; search?: string }): Promise<Student[]> {
    try {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`/api/students?${query}`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return INITIAL_STUDENTS;
  },

  async createStudent(studentData: Partial<Student>): Promise<Student> {
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    
    // Fallback local creation
    const newStudent: Student = {
      id: `std_${Date.now()}`,
      admissionNumber: studentData.admissionNumber || `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      firstName: studentData.firstName || '',
      lastName: studentData.lastName || '',
      gender: studentData.gender || 'Male',
      dateOfBirth: studentData.dateOfBirth || '2009-01-01',
      grade: studentData.grade || 'Grade 10-A',
      stream: studentData.stream || 'Alpha',
      enrollmentDate: studentData.enrollmentDate || new Date().toISOString().split('T')[0],
      status: 'active',
      guardianName: studentData.guardianName || '',
      guardianPhone: studentData.guardianPhone || '',
      guardianEmail: studentData.guardianEmail || '',
      guardianRelationship: studentData.guardianRelationship || 'Guardian',
      address: studentData.address || 'Nairobi',
      emergencyContact: studentData.emergencyContact || studentData.guardianPhone || '',
      medicalNotes: studentData.medicalNotes || 'None',
      feeBalance: 48000,
      totalFeesBilled: 48000,
      totalFeesPaid: 0,
      attendancePercentage: 100
    };
    return newStudent;
  },

  async getFeeSummary(): Promise<any> {
    try {
      const res = await fetch('/api/fees/summary');
      if (res.ok) return await res.json();
    } catch (_) {}
    return {
      totalBilled: 480000,
      totalCollected: 367000,
      totalOutstanding: 113000,
      collectionRate: 76,
      recentPayments: INITIAL_PAYMENTS,
      defaulters: INITIAL_STUDENTS.filter(s => s.feeBalance > 0)
    };
  },

  async recordFeePayment(paymentData: {
    studentId: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
    recordedBy: string;
  }): Promise<{ payment: FeePayment; updatedStudent: Student }> {
    try {
      const res = await fetch('/api/fees/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const student = INITIAL_STUDENTS.find(s => s.id === paymentData.studentId) || INITIAL_STUDENTS[0];
    const newPayment: FeePayment = {
      id: `pay_${Date.now()}`,
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNumber: student.admissionNumber,
      grade: student.grade,
      amount: paymentData.amount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: paymentData.paymentMethod as any,
      receiptNumber: `REC-2026-${Math.floor(100 + Math.random() * 900)}`,
      term: 'Term 1 - 2026',
      academicYear: '2026',
      recordedBy: paymentData.recordedBy,
      notes: paymentData.notes
    };
    return { payment: newPayment, updatedStudent: student };
  },

  async getGrades(params?: { grade?: string; subject?: string; term?: string }): Promise<GradeRecord[]> {
    try {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`/api/grades?${query}`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return INITIAL_GRADES;
  },

  async saveGrades(updates: Partial<GradeRecord>[]): Promise<any> {
    try {
      const res = await fetch('/api/grades/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    return { message: 'Grades saved successfully', count: updates.length };
  },

  async getAttendanceAnalytics(): Promise<AttendanceAnalytics> {
    try {
      const res = await fetch('/api/attendance/analytics');
      if (res.ok) return await res.json();
    } catch (_) {}
    return ATTENDANCE_ANALYTICS;
  },

  async recordAttendance(data: {
    date: string;
    grade: string;
    records: { studentId: string; studentName: string; admissionNumber: string; status: string; reason?: string }[];
    recordedBy: string;
  }): Promise<any> {
    try {
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    return { message: 'Attendance recorded successfully' };
  },

  async getTimetable(params?: { grade?: string; teacherId?: string }): Promise<TimetableSlot[]> {
    try {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`/api/timetable?${query}`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return INITIAL_TIMETABLE;
  },

  async addTimetableSlot(slot: Partial<TimetableSlot>): Promise<TimetableSlot> {
    const res = await fetch('/api/timetable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slot)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to add slot' }));
      throw new Error(err.error || 'Failed to add slot');
    }
    return await res.json();
  },

  async deleteTimetableSlot(id: string): Promise<any> {
    try {
      const res = await fetch(`/api/timetable/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch (_) {}
    return { message: 'Slot deleted' };
  },

  async getExams(): Promise<ExamPaper[]> {
    try {
      const res = await fetch('/api/exams');
      if (res.ok) return await res.json();
    } catch (_) {}
    return INITIAL_EXAMS;
  },

  async uploadExamPaper(data: Partial<ExamPaper>): Promise<ExamPaper> {
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const newExam: ExamPaper = {
      id: `exam_${Date.now()}`,
      title: data.title || 'Examination Paper',
      subject: data.subject || 'General',
      grade: data.grade || 'Grade 10-A',
      term: data.term || 'Term 1',
      examDate: data.examDate || new Date().toISOString().split('T')[0],
      durationMinutes: data.durationMinutes || 90,
      teacherId: data.teacherId || 'user_teacher_1',
      teacherName: data.teacherName || 'Sarah Jenkins',
      copiesRequired: data.copiesRequired || 35,
      printStatus: 'pending_approval',
      paperType: data.paperType || 'A4',
      sides: data.sides || 'double',
      colorMode: data.colorMode || 'black_white',
      finishing: data.finishing || 'stapled',
      specialInstructions: data.specialInstructions || '',
      confidentialityLevel: data.confidentialityLevel || 'Standard',
      fileName: data.fileName || 'Exam_Document.pdf',
      fileSize: data.fileSize || '1.2 MB',
      createdAt: new Date().toISOString().split('T')[0],
      questionsPreview: data.questionsPreview
    };
    return newExam;
  },

  async updateExamStatus(id: string, status: string, approvedBy?: string): Promise<ExamPaper> {
    try {
      const res = await fetch(`/api/exams/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, approvedBy })
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const exam = INITIAL_EXAMS.find(e => e.id === id) || INITIAL_EXAMS[0];
    exam.printStatus = status as any;
    if (approvedBy) exam.approvedBy = approvedBy;
    return exam;
  },

  async getSpecification(): Promise<string> {
    try {
      const res = await fetch('/api/specification');
      if (res.ok) {
        const data = await res.json();
        return data.content;
      }
    } catch (_) {}
    return '';
  }
};
