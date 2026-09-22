export type UserRole = 'admin' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  title: string; // e.g. "Senior Administrator", "Science Department Head"
  assignedClasses: string[];
  assignedSubjects: string[];
  phone: string;
}

export type StudentStatus = 'active' | 'transferred' | 'graduated' | 'suspended';

export interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string; // YYYY-MM-DD
  grade: string; // e.g. "Grade 9", "Grade 10-A"
  stream: string; // e.g. "North", "Alpha", "A"
  enrollmentDate: string;
  status: StudentStatus;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianRelationship: string;
  address: string;
  emergencyContact: string;
  medicalNotes?: string;
  feeBalance: number;
  totalFeesBilled: number;
  totalFeesPaid: number;
  attendancePercentage: number;
}

export interface FeeStructure {
  id: string;
  grade: string;
  term: string; // e.g. "Term 1 - 2026"
  academicYear: string;
  breakdown: {
    tuition: number;
    activities: number;
    library: number;
    scienceLab: number;
    meals: number;
    examination: number;
  };
  totalAmount: number;
}

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Mobile Money' | 'Card';

export interface FeePayment {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  grade: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  receiptNumber: string;
  term: string;
  academicYear: string;
  recordedBy: string;
  notes?: string;
}

export type AssessmentType = 'Mid-Term' | 'End-Term' | 'Quiz' | 'Assignment';
export type LetterGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface GradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  grade: string;
  subject: string;
  term: string;
  academicYear: string;
  assessmentType: AssessmentType;
  score: number; // 0-100
  maxScore: number;
  percentage: number;
  letterGrade: LetterGrade;
  remarks: string;
  recordedBy: string;
  updatedAt: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'excused';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  grade: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  status: AttendanceStatus;
  reason?: string;
  recordedBy: string;
}

export interface TimetableSlot {
  id: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  periodIndex: number; // 1 to 7
  periodName: string; // e.g. "Period 1 (08:00 - 08:45)"
  startTime: string;
  endTime: string;
  grade: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  room: string;
}

export type PrintStatus = 'pending_approval' | 'queued' | 'printing' | 'ready_for_pickup' | 'collected';
export type ConfidentialityLevel = 'Standard' | 'Strict' | 'High Security';

export interface ExamPaper {
  id: string;
  title: string;
  subject: string;
  grade: string;
  term: string;
  examDate: string;
  durationMinutes: number;
  teacherId: string;
  teacherName: string;
  copiesRequired: number;
  printStatus: PrintStatus;
  paperType: 'A4' | 'Legal';
  sides: 'single' | 'double';
  colorMode: 'black_white' | 'color';
  finishing: 'stapled' | 'loose';
  specialInstructions?: string;
  confidentialityLevel: ConfidentialityLevel;
  fileName: string;
  fileSize: string;
  createdAt: string;
  approvedBy?: string;
  questionsPreview?: string[];
}

export interface AttendanceAnalytics {
  overallRate: number;
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  lateToday?: number;
  excusedToday: number;
  dailyTrends: {
    date: string;
    dayLabel: string;
    rate: number;
    present: number;
    absent: number;
  }[];
  gradeComparison: {
    grade: string;
    rate: number;
    totalStudents: number;
    absentCount: number;
  }[];
  chronicAbsentees: {
    studentId: string;
    name: string;
    admissionNumber: string;
    grade: string;
    daysMissed: number;
    attendanceRate: number;
    guardianPhone: string;
  }[];
}

export interface StudentReportCard {
  student: Student;
  term: string;
  academicYear: string;
  issueDate: string;
  subjects: {
    subject: string;
    midTermScore: number;
    endTermScore: number;
    averageScore: number;
    letterGrade: LetterGrade;
    rankInClass: number;
    teacherRemarks: string;
    teacherName: string;
  }[];
  totalScore: number;
  maxPossibleScore: number;
  percentageAverage: number;
  overallGrade: LetterGrade;
  classRank: number;
  totalStudentsInClass: number;
  attendanceDaysHeld: number;
  attendanceDaysPresent: number;
  attendancePercentage: number;
  classTeacherRemarks: string;
  principalRemarks: string;
}
