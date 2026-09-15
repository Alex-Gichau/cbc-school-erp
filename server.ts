import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { MongoClient, Db } from 'mongodb';
import { createServer as createViteServer } from 'vite';

import {
  DEMO_USERS,
  INITIAL_STUDENTS,
  INITIAL_PAYMENTS,
  INITIAL_GRADES,
  INITIAL_TIMETABLE,
  INITIAL_EXAMS,
  ATTENDANCE_ANALYTICS
} from './src/data/mockData';
import {
  Student,
  FeePayment,
  GradeRecord,
  AttendanceRecord,
  TimetableSlot,
  ExamPaper,
  AttendanceAnalytics
} from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();
app.use(express.json());

// In-Memory persistent fallback state initialized with rich seed data
let studentsStore: Student[] = [...INITIAL_STUDENTS];
let paymentsStore: FeePayment[] = [...INITIAL_PAYMENTS];
let gradesStore: GradeRecord[] = [...INITIAL_GRADES];
let timetableStore: TimetableSlot[] = [...INITIAL_TIMETABLE];
let examsStore: ExamPaper[] = [...INITIAL_EXAMS];
let attendanceRecordsStore: AttendanceRecord[] = [];
let attendanceAnalyticsStore: AttendanceAnalytics = { ...ATTENDANCE_ANALYTICS };

// MongoDB integration variables
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let isMongoConnected = false;

async function initMongoDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('localhost') || uri.includes('MY_MONGODB_URI')) {
    console.log('[Database] MONGODB_URI not pointing to remote cluster; using embedded high-speed school store.');
    return;
  }

  try {
    mongoClient = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 });
    await mongoClient.connect();
    mongoDb = mongoClient.db('school_management');
    isMongoConnected = true;
    console.log('[Database] Successfully connected to MongoDB cluster.');

    // Seed initial collections if empty
    const studentsCol = mongoDb.collection('students');
    const count = await studentsCol.countDocuments();
    if (count === 0) {
      await studentsCol.insertMany(INITIAL_STUDENTS as any);
      await mongoDb.collection('fees').insertMany(INITIAL_PAYMENTS as any);
      await mongoDb.collection('grades').insertMany(INITIAL_GRADES as any);
      await mongoDb.collection('timetable').insertMany(INITIAL_TIMETABLE as any);
      await mongoDb.collection('exams').insertMany(INITIAL_EXAMS as any);
      console.log('[Database] Seeded initial collections into MongoDB.');
    }
  } catch (err) {
    console.warn('[Database] MongoDB connection attempt timed out or failed; safely operating with in-memory persistence.', err);
    isMongoConnected = false;
  }
}

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------

// System Health & Database Status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    appName: 'Edura School Management System',
    timestamp: new Date().toISOString(),
    database: {
      provider: isMongoConnected ? 'MongoDB (Connected)' : 'Local High-Speed School Database (Embedded)',
      connected: isMongoConnected,
      totalLearners: studentsStore.length,
      totalExamsInQueue: examsStore.length,
      timetableSlots: timetableStore.length
    }
  });
});

// Users / Auth endpoints
app.get('/api/users', (req: Request, res: Response) => {
  res.json(DEMO_USERS);
});

// Students / Enrolment endpoints
app.get('/api/students', (req: Request, res: Response) => {
  const { grade, status, search } = req.query;
  let result = [...studentsStore];

  if (grade && typeof grade === 'string' && grade !== 'all') {
    result = result.filter(s => s.grade.toLowerCase() === grade.toLowerCase());
  }
  if (status && typeof status === 'string' && status !== 'all') {
    result = result.filter(s => s.status === status);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    result = result.filter(
      s =>
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q) ||
        s.guardianName.toLowerCase().includes(q)
    );
  }

  res.json(result);
});

app.post('/api/students', (req: Request, res: Response) => {
  const body = req.body;
  const newStudent: Student = {
    id: `std_${Date.now()}`,
    admissionNumber: body.admissionNumber || `ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    firstName: body.firstName,
    lastName: body.lastName,
    gender: body.gender || 'Male',
    dateOfBirth: body.dateOfBirth || '2009-01-01',
    grade: body.grade || 'Grade 10-A',
    stream: body.stream || 'Alpha',
    enrollmentDate: body.enrollmentDate || new Date().toISOString().split('T')[0],
    status: 'active',
    guardianName: body.guardianName,
    guardianPhone: body.guardianPhone,
    guardianEmail: body.guardianEmail || '',
    guardianRelationship: body.guardianRelationship || 'Guardian',
    address: body.address || 'Nairobi',
    emergencyContact: body.emergencyContact || body.guardianPhone,
    medicalNotes: body.medicalNotes || 'None',
    feeBalance: 48000,
    totalFeesBilled: 48000,
    totalFeesPaid: 0,
    attendancePercentage: 100
  };

  studentsStore.unshift(newStudent);

  // Sync with MongoDB if connected
  if (isMongoConnected && mongoDb) {
    mongoDb.collection('students').insertOne(newStudent).catch(console.error);
  }

  res.status(201).json(newStudent);
});

app.put('/api/students/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = studentsStore.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }

  studentsStore[index] = { ...studentsStore[index], ...req.body };

  if (isMongoConnected && mongoDb) {
    mongoDb.collection('students').updateOne({ id }, { $set: req.body }).catch(console.error);
  }

  res.json(studentsStore[index]);
});

// Fees Management
app.get('/api/fees/payments', (req: Request, res: Response) => {
  res.json(paymentsStore);
});

app.get('/api/fees/summary', (req: Request, res: Response) => {
  const totalBilled = studentsStore.reduce((acc, s) => acc + s.totalFeesBilled, 0);
  const totalCollected = studentsStore.reduce((acc, s) => acc + s.totalFeesPaid, 0);
  const totalOutstanding = totalBilled - totalCollected;
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  res.json({
    totalBilled,
    totalCollected,
    totalOutstanding,
    collectionRate,
    recentPayments: paymentsStore.slice(0, 10),
    defaulters: studentsStore.filter(s => s.feeBalance > 0).sort((a, b) => b.feeBalance - a.feeBalance)
  });
});

app.post('/api/fees/payments', (req: Request, res: Response) => {
  const { studentId, amount, paymentMethod, notes, recordedBy } = req.body;
  const student = studentsStore.find(s => s.id === studentId);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const numericAmount = Number(amount);
  const newPayment: FeePayment = {
    id: `pay_${Date.now()}`,
    studentId,
    studentName: `${student.firstName} ${student.lastName}`,
    admissionNumber: student.admissionNumber,
    grade: student.grade,
    amount: numericAmount,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: paymentMethod || 'Mobile Money',
    receiptNumber: `REC-2026-${Math.floor(100 + paymentsStore.length + 1)}`,
    term: 'Term 1 - 2026',
    academicYear: '2026',
    recordedBy: recordedBy || 'Bursar Office',
    notes: notes || 'Tuition and fees installment'
  };

  // Update student balances
  student.totalFeesPaid += numericAmount;
  student.feeBalance = Math.max(0, student.totalFeesBilled - student.totalFeesPaid);

  paymentsStore.unshift(newPayment);

  if (isMongoConnected && mongoDb) {
    mongoDb.collection('fees').insertOne(newPayment).catch(console.error);
    mongoDb.collection('students').updateOne(
      { id: studentId },
      { $set: { totalFeesPaid: student.totalFeesPaid, feeBalance: student.feeBalance } }
    ).catch(console.error);
  }

  res.status(201).json({ payment: newPayment, updatedStudent: student });
});

// Grades & Performance
app.get('/api/grades', (req: Request, res: Response) => {
  const { grade, subject, term } = req.query;
  let results = [...gradesStore];

  if (grade && typeof grade === 'string' && grade !== 'all') {
    results = results.filter(g => g.grade.toLowerCase() === grade.toLowerCase());
  }
  if (subject && typeof subject === 'string' && subject !== 'all') {
    results = results.filter(g => g.subject.toLowerCase() === subject.toLowerCase());
  }
  if (term && typeof term === 'string') {
    results = results.filter(g => g.term === term);
  }

  res.json(results);
});

app.post('/api/grades/batch', (req: Request, res: Response) => {
  const { updates } = req.body; // array of GradeRecord items
  if (!Array.isArray(updates)) {
    return res.status(400).json({ error: 'Updates must be an array' });
  }

  updates.forEach(upd => {
    const existingIndex = gradesStore.findIndex(
      g => g.studentId === upd.studentId && g.subject === upd.subject && g.assessmentType === upd.assessmentType
    );

    const score = Number(upd.score);
    let letterGrade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
    let defaultRemark = 'Needs improvement';

    if (score >= 80) {
      letterGrade = 'A';
      defaultRemark = 'Excellent mastery of concepts';
    } else if (score >= 70) {
      letterGrade = 'B';
      defaultRemark = 'Very good work';
    } else if (score >= 60) {
      letterGrade = 'C';
      defaultRemark = 'Satisfactory performance';
    } else if (score >= 50) {
      letterGrade = 'D';
      defaultRemark = 'Pass; extra focus recommended';
    } else {
      letterGrade = 'F';
      defaultRemark = 'Requires remedial support';
    }

    const record: GradeRecord = {
      id: upd.id || `grd_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      studentId: upd.studentId,
      studentName: upd.studentName,
      admissionNumber: upd.admissionNumber,
      grade: upd.grade,
      subject: upd.subject,
      term: upd.term || 'Term 1',
      academicYear: '2026',
      assessmentType: upd.assessmentType || 'End-Term',
      score,
      maxScore: 100,
      percentage: score,
      letterGrade,
      remarks: upd.remarks || defaultRemark,
      recordedBy: upd.recordedBy || 'Class Teacher',
      updatedAt: new Date().toISOString().split('T')[0]
    };

    if (existingIndex >= 0) {
      gradesStore[existingIndex] = record;
    } else {
      gradesStore.push(record);
    }
  });

  res.json({ message: 'Grades saved successfully', count: updates.length });
});

// Attendance & Analytics
app.get('/api/attendance/analytics', (req: Request, res: Response) => {
  res.json(attendanceAnalyticsStore);
});

app.post('/api/attendance/mark', (req: Request, res: Response) => {
  const { date, grade, records, recordedBy } = req.body;
  if (!Array.isArray(records)) {
    return res.status(400).json({ error: 'Records must be an array' });
  }

  // Remove existing records for that date and grade
  attendanceRecordsStore = attendanceRecordsStore.filter(
    r => !(r.date === date && r.grade.toLowerCase() === grade.toLowerCase())
  );

  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;

  records.forEach((rec: any) => {
    const item: AttendanceRecord = {
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      date,
      grade,
      studentId: rec.studentId,
      studentName: rec.studentName,
      admissionNumber: rec.admissionNumber,
      status: rec.status || 'present',
      reason: rec.reason || '',
      recordedBy: recordedBy || 'Teacher'
    };

    if (rec.status === 'present') presentCount++;
    else if (rec.status === 'absent') absentCount++;
    else if (rec.status === 'late') lateCount++;
    else if (rec.status === 'excused') excusedCount++;

    attendanceRecordsStore.push(item);
  });

  // Re-calculate analytics summary
  const totalMarked = records.length;
  const todayRate = totalMarked > 0 ? Math.round(((presentCount + lateCount) / totalMarked) * 1000) / 10 : 95.0;

  attendanceAnalyticsStore.presentToday = 322 + (presentCount - 30);
  attendanceAnalyticsStore.absentToday = absentCount;
  attendanceAnalyticsStore.lateToday = lateCount;
  attendanceAnalyticsStore.excusedToday = excusedCount;

  res.json({
    message: 'Attendance recorded successfully',
    summary: { totalMarked, presentCount, absentCount, lateCount, excusedCount, todayRate }
  });
});

// Timetable Scheduling
app.get('/api/timetable', (req: Request, res: Response) => {
  const { grade, teacherId } = req.query;
  let result = [...timetableStore];

  if (grade && typeof grade === 'string' && grade !== 'all') {
    result = result.filter(t => t.grade.toLowerCase() === grade.toLowerCase());
  }
  if (teacherId && typeof teacherId === 'string' && teacherId !== 'all') {
    result = result.filter(t => t.teacherId === teacherId);
  }

  res.json(result);
});

app.post('/api/timetable', (req: Request, res: Response) => {
  const slot: TimetableSlot = {
    id: `tt_${Date.now()}`,
    dayOfWeek: req.body.dayOfWeek,
    periodIndex: Number(req.body.periodIndex),
    periodName: req.body.periodName || `Period ${req.body.periodIndex}`,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    grade: req.body.grade,
    subject: req.body.subject,
    teacherId: req.body.teacherId,
    teacherName: req.body.teacherName,
    room: req.body.room
  };

  // Conflict detection: Is teacher or room already scheduled at the same day and period?
  const conflict = timetableStore.find(
    t =>
      t.dayOfWeek === slot.dayOfWeek &&
      t.periodIndex === slot.periodIndex &&
      (t.teacherId === slot.teacherId || t.room.toLowerCase() === slot.room.toLowerCase())
  );

  if (conflict) {
    const isTeacher = conflict.teacherId === slot.teacherId;
    return res.status(409).json({
      error: isTeacher
        ? `Scheduling Conflict: ${conflict.teacherName} is already assigned to ${conflict.grade} in ${conflict.room} during ${slot.dayOfWeek} ${slot.periodName}.`
        : `Room Conflict: ${conflict.room} is already booked for ${conflict.subject} (${conflict.grade}) during this period.`
    });
  }

  timetableStore.push(slot);
  res.status(201).json(slot);
});

app.delete('/api/timetable/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  timetableStore = timetableStore.filter(t => t.id !== id);
  res.json({ message: 'Timetable slot removed' });
});

// Exam Upload & Printing Portal
app.get('/api/exams', (req: Request, res: Response) => {
  res.json(examsStore);
});

app.post('/api/exams', (req: Request, res: Response) => {
  const body = req.body;
  const newExam: ExamPaper = {
    id: `exam_${Date.now()}`,
    title: body.title,
    subject: body.subject,
    grade: body.grade,
    term: body.term || 'Term 1',
    examDate: body.examDate,
    durationMinutes: Number(body.durationMinutes || 90),
    teacherId: body.teacherId || 'user_teacher_1',
    teacherName: body.teacherName || 'Sarah Jenkins',
    copiesRequired: Number(body.copiesRequired || 35),
    printStatus: 'pending_approval',
    paperType: body.paperType || 'A4',
    sides: body.sides || 'double',
    colorMode: body.colorMode || 'black_white',
    finishing: body.finishing || 'stapled',
    specialInstructions: body.specialInstructions || '',
    confidentialityLevel: body.confidentialityLevel || 'Standard',
    fileName: body.fileName || `${body.subject}_Exam.pdf`,
    fileSize: body.fileSize || '1.2 MB',
    createdAt: new Date().toISOString().split('T')[0],
    questionsPreview: body.questionsPreview || [
      'Instructions to Candidates: Answer all questions in Section A and any three questions from Section B.',
      'Check that this paper contains all designated examination questions and required formula sheets.'
    ]
  };

  examsStore.unshift(newExam);
  res.status(201).json(newExam);
});

app.put('/api/exams/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, approvedBy } = req.body;

  const exam = examsStore.find(e => e.id === id);
  if (!exam) {
    return res.status(404).json({ error: 'Exam requisition not found' });
  }

  exam.printStatus = status;
  if (approvedBy) exam.approvedBy = approvedBy;

  res.json(exam);
});

// Non-Technical Specification Document API
app.get('/api/specification', (req: Request, res: Response) => {
  try {
    const specPath = path.join(process.cwd(), 'SYSTEM_SPECIFICATION.md');
    if (fs.existsSync(specPath)) {
      const content = fs.readFileSync(specPath, 'utf-8');
      return res.json({ content });
    }
    res.status(404).json({ error: 'Specification document file not found' });
  } catch (err) {
    res.status(500).json({ error: 'Unable to read specification document' });
  }
});

// -------------------------------------------------------------
// Vite Middleware / Static Serving
// -------------------------------------------------------------
async function startServer() {
  await initMongoDB();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Edura Server] Running at http://localhost:${PORT}`);
  });
}

startServer();
