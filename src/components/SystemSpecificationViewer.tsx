import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Search,
  CheckCircle2,
  Users,
  CreditCard,
  Award,
  CalendarDays,
  Printer as PrinterIcon,
  ShieldCheck,
  Download,
  BookOpen
} from 'lucide-react';

export const SystemSpecificationViewer: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const sections = [
    { id: 'all', title: 'Full Document' },
    { id: 'overview', title: '1. System Overview & Roles' },
    { id: 'admissions', title: '2. Admissions & Student Cards' },
    { id: 'fees', title: '3. Fee Packages & Receipts' },
    { id: 'attendance', title: '4. Roll Call & Trends' },
    { id: 'grading', title: '5. Academic Grading' },
    { id: 'reports', title: '6. Report Cards' },
    { id: 'timetable', title: '7. Timetable & Schedules' },
    { id: 'exams', title: '8. Exam Printing Workflow' },
    { id: 'security', title: '9. Security & Privacy' }
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-bold text-slate-900 font-serif">
              System Specification & Operational Guide
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official non-technical documentation prepared for School Trustees, Principals, Teachers, and Bursars.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/15 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Complete Manual</span>
        </button>
      </div>

      {/* Nav Pills for Sections */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 print:hidden">
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeSection === sec.id
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {sec.title}
          </button>
        ))}
      </div>

      {/* Document Body */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xs max-w-4xl mx-auto space-y-8 text-slate-800 font-sans print:border-none print:shadow-none print:p-0">
        {/* Title Cover Block */}
        <div className="border-b-2 border-slate-900 pb-6 text-center space-y-2">
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 text-[11px] font-bold uppercase tracking-wider rounded-full font-sans">
            Plain Language Operational Standard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-serif">
            Edura School Management System
          </h1>
          <p className="text-sm font-serif italic text-slate-600">
            Comprehensive System Specification & Operational Guide
          </p>
          <p className="text-xs text-slate-500 font-medium pt-2">
            Written in Everyday Language — Free of Technical Jargon • Approved for School Administrative Operations
          </p>
        </div>

        {/* Section: Overview */}
        {(activeSection === 'all' || activeSection === 'overview') && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 font-serif border-b border-slate-200 pb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-sans font-bold">1</span>
              <span>Overview of the System & Role-Based Access</span>
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
              The Edura School Management System serves as the centralized digital administrative office for our school. It replaces paper filing cabinets, handwritten mark sheets, paper receipt booklets, and staff room noticeboards with one secure, accessible place where teachers and administrators collaborate seamlessly.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-xs text-indigo-900 uppercase tracking-wider block">
                  School Administrators (Principals, Deputies & Bursars)
                </span>
                <ul className="text-xs space-y-1.5 text-slate-600 list-disc list-inside">
                  <li>Admit and register new learners with automatic student numbers.</li>
                  <li>Issue official fee receipts and monitor arrears across classes.</li>
                  <li>Review real-time school-wide attendance trends and chronic absenteeism alerts.</li>
                  <li>Schedule master timetables and eliminate teacher/classroom double-bookings.</li>
                  <li>Supervise the exam printing queue and confidential storage.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-xs text-emerald-900 uppercase tracking-wider block">
                  Teachers (Class Instructors & Subject Examiners)
                </span>
                <ul className="text-xs space-y-1.5 text-slate-600 list-disc list-inside">
                  <li>Conduct daily morning roll calls with instant headmaster synchronization.</li>
                  <li>Enter continuous assessment, mid-term, and final exam test scores.</li>
                  <li>Auto-convert marks into standardized letter grades with remarks.</li>
                  <li>Upload examination papers with photocopying, stapling, and security specs.</li>
                  <li>Generate and print terminal student report cards for parent meetings.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Section: Admissions */}
        {(activeSection === 'all' || activeSection === 'admissions') && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 font-serif border-b border-slate-200 pb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-sans font-bold">2</span>
              <span>Learner Admissions & Electronic Student Cards</span>
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
              When a child joins our school, the office registers an electronic student profile that remains with them through graduation.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-800">Four-Step Registration Procedure:</span>
              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                <li><strong>Application Data Entry:</strong> Staff record learner name, birth date, gender, address, and special medical conditions (e.g. asthma, food allergies).</li>
                <li><strong>Unique Admission Number:</strong> The system automatically issues a standardized school identification code (e.g. ADM-2026-0101).</li>
                <li><strong>Class Stream Placement:</strong> The student is assigned to their grade classroom and class teacher.</li>
                <li><strong>Automatic Financial & Academic Ledgers:</strong> An electronic fee account, attendance card, and term report card are instantly initiated.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Section: Fees */}
        {(activeSection === 'all' || activeSection === 'fees') && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 font-serif border-b border-slate-200 pb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-sans font-bold">3</span>
              <span>School Fee Management & Printable Receipts</span>
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
              The fee module gives the school administration and parents transparent visibility into every coin paid toward school services.
            </p>
            <ul className="text-xs space-y-2 text-slate-700 list-disc list-inside">
              <li><strong>Itemized Fee Packages:</strong> Standard packages clearly distinguish tuition, laboratory supplies, library books, co-curricular sports, meals, and examination printing.</li>
              <li><strong>Multi-Channel Collections:</strong> Supports Bank Wire, Mobile Money (M-Pesa), Direct Card, and Cash Office transactions.</li>
              <li><strong>Numbered Receipts:</strong> Generates an official, printed slip containing the school crest, receipt serial number, amount in words, student name, and receiving cashier stamp.</li>
              <li><strong>Real-Time Arrears Tracking:</strong> Automatic identification of outstanding balances so the bursar can issue polite parent reminders before exams.</li>
            </ul>
          </div>
        )}

        {/* Section: Attendance */}
        {(activeSection === 'all' || activeSection === 'attendance') && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 font-serif border-b border-slate-200 pb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-sans font-bold">4</span>
              <span>Daily Roll Call & School-Wide Attendance Trends</span>
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
              Accounting for every learner daily is vital for child safety and academic continuity.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="font-bold text-emerald-900 block">Morning Check-In</span>
                <p className="text-emerald-700 mt-1">
                  Class teachers mark Present, Absent, Late, or Excused in seconds using a single-tap interface.
                </p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                <span className="font-bold text-indigo-900 block">School-Wide Trends</span>
                <p className="text-indigo-700 mt-1">
                  A visual analytics dashboard shows daily trends across weekdays and compares attendance rates across all classes.
                </p>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                <span className="font-bold text-rose-900 block">Early Warning System</span>
                <p className="text-rose-700 mt-1">
                  Learners missing more than 15% of sessions are automatically flagged for welfare and parental contact.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section: Grading */}
        {(activeSection === 'all' || activeSection === 'grading') && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 font-serif border-b border-slate-200 pb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-sans font-bold">5</span>
              <span>Academic Performance & Grading Matrix</span>
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
              A standard letter grading scale ensures that marks are evaluated fairly and transparently across all subjects.
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="grid grid-cols-5 font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
                <span>Grade</span>
                <span>Score Range</span>
                <span>Classification</span>
                <span className="col-span-2">Standard Pedagogical Meaning</span>
              </div>
              <div className="grid grid-cols-5 text-slate-800 py-1 border-b border-slate-100">
                <span className="font-black text-emerald-700">A</span>
                <span>80% – 100%</span>
                <span className="font-semibold">Distinction</span>
                <span className="col-span-2">Exceptional mastery of core competencies and principles.</span>
              </div>
              <div className="grid grid-cols-5 text-slate-800 py-1 border-b border-slate-100">
                <span className="font-black text-blue-700">B</span>
                <span>70% – 79%</span>
                <span className="font-semibold">Very Good</span>
                <span className="col-span-2">Consistently solid understanding with minor room for growth.</span>
              </div>
              <div className="grid grid-cols-5 text-slate-800 py-1 border-b border-slate-100">
                <span className="font-black text-indigo-700">C</span>
                <span>60% – 69%</span>
                <span className="font-semibold">Credit / Good</span>
                <span className="col-span-2">Satisfactory application; regular revision recommended.</span>
              </div>
              <div className="grid grid-cols-5 text-slate-800 py-1 border-b border-slate-100">
                <span className="font-black text-amber-700">D</span>
                <span>50% – 59%</span>
                <span className="font-semibold">Pass</span>
                <span className="col-span-2">Borderline achievement; requires supplementary instruction.</span>
              </div>
              <div className="grid grid-cols-5 text-slate-800 py-1">
                <span className="font-black text-rose-700">F</span>
                <span>Below 50%</span>
                <span className="font-semibold">Remedial</span>
                <span className="col-span-2">Requires urgent academic clinic and guardian review.</span>
              </div>
            </div>
          </div>
        )}

        {/* Section: Reports */}
        {(activeSection === 'all' || activeSection === 'reports') && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 font-serif border-b border-slate-200 pb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-sans font-bold">6</span>
              <span>Terminal Learner Report Cards</span>
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
              Terminal reports provide parents with a holistic portrait of their child's academic, co-curricular, and moral progress during the term.
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-700">
              <span className="font-bold text-slate-900 block mb-1">Standard Report Components:</span>
              <p>• Official School Crest, Term, Academic Year, and Motto.</p>
              <p>• Student Name, Admission Number, Class Stream, and Days Present.</p>
              <p>• Subject Marks Table with Continuous Assessment (30%), Term Exam (70%), Total Mark (100%), and Subject Teacher Remark.</p>
              <p>• Term Average Percentage, Class Rank (e.g., 2nd out of 34), and Conduct Assessment.</p>
              <p>• Class Teacher's Signature and Principal's Official Seal & Next Term Resumption Date.</p>
            </div>
          </div>
        )}

        {/* Section: Timetable */}
        {(activeSection === 'all' || activeSection === 'timetable') && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 font-serif border-b border-slate-200 pb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-sans font-bold">7</span>
              <span>Master Timetable & Lesson Scheduling</span>
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
              The weekly timetable ensures orderly movement of teachers and students across standard school periods without logistical clashes.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Class & Teacher Perspectives</span>
                <p className="text-slate-600">
                  Allows viewing the timetable by class (what Grade 10-A is doing all week) or by teacher (an instructor's individual teaching load and free periods).
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Conflict Avoidance Shield</span>
                <p className="text-slate-600">
                  Automatically flags if a teacher or laboratory room is already booked in that exact period before scheduling.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section: Exam Printing */}
        {(activeSection === 'all' || activeSection === 'exams') && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 font-serif border-b border-slate-200 pb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-sans font-bold">8</span>
              <span>Teacher Exam Upload & Secure Printing Portal</span>
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
              Streamlines examination preparation by enabling teachers to submit papers ahead of test week with exact copying, stapling, and confidentiality instructions.
            </p>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-xs space-y-2 text-purple-950">
              <span className="font-bold uppercase tracking-wider text-[11px] block">
                Printing Lifecycle Stages:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center">
                <div className="p-2 bg-white rounded border border-purple-200">
                  <span className="font-black block">1. Submitted</span>
                  <span className="text-[10px] text-purple-700">Awaiting Head check</span>
                </div>
                <div className="p-2 bg-white rounded border border-purple-200">
                  <span className="font-black block">2. In Queue</span>
                  <span className="text-[10px] text-purple-700">Print room docket</span>
                </div>
                <div className="p-2 bg-white rounded border border-purple-200">
                  <span className="font-black block">3. Printing</span>
                  <span className="text-[10px] text-purple-700">Photocopier running</span>
                </div>
                <div className="p-2 bg-white rounded border border-purple-200">
                  <span className="font-black block">4. Ready</span>
                  <span className="text-[10px] text-purple-700">In sealed locker</span>
                </div>
                <div className="p-2 bg-white rounded border border-purple-200">
                  <span className="font-black block">5. Dispatched</span>
                  <span className="text-[10px] text-purple-700">Signed out for exam</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section: Security */}
        {(activeSection === 'all' || activeSection === 'security') && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 font-serif border-b border-slate-200 pb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-sans font-bold">9</span>
              <span>Data Protection, Confidentiality & Audit Log</span>
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
              Protecting student confidentiality and academic integrity is of the highest priority.
            </p>
            <ul className="text-xs space-y-1.5 text-slate-700 list-disc list-inside">
              <li><strong>Role Isolation:</strong> Teachers only have permission to edit grades and attendance for their assigned subjects and classes. Bursar records are restricted to financial administrators.</li>
              <li><strong>Audit Timestamping:</strong> Every mark entered and payment receipt issued records the exact time and staff member responsible.</li>
              <li><strong>Parent Contact Privacy:</strong> Emergency telephone numbers, home addresses, and confidential medical notes are strictly shielded.</li>
              <li><strong>Automated Database Redundancy:</strong> Continuous persistence safeguards against loss of academic history.</li>
            </ul>
          </div>
        )}

        {/* Sign-off Block */}
        <div className="pt-6 border-t border-slate-300 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 font-serif">
          <div>Approved by School Governing Council & Academic Committee</div>
          <div className="mt-2 sm:mt-0 font-mono text-[11px]">System Specification Version 1.0 (2026)</div>
        </div>
      </div>
    </div>
  );
};
