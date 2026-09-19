import React, { useState, useMemo } from 'react';
import {
  Printer,
  X,
  FileText,
  Download,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Building2,
  CreditCard,
  ShieldCheck,
  Calendar,
  User,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Student, FeePayment } from '../types';

interface StudentFeeStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  payments: FeePayment[];
  initialStudentId?: string;
  onRecordPayment?: (studentId: string) => void;
}

export const StudentFeeStatementModal: React.FC<StudentFeeStatementModalProps> = ({
  isOpen,
  onClose,
  students,
  payments,
  initialStudentId,
  onRecordPayment
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || students[0]?.id || ''
  );
  const [selectedTerm, setSelectedTerm] = useState('Term 1 - 2026');
  const [copied, setCopied] = useState(false);

  // Sync initial student if changed
  React.useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
    }
  }, [initialStudentId]);

  const currentStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || students[0];
  }, [students, selectedStudentId]);

  // Filter payments for current student and sort chronologically
  const studentPayments = useMemo(() => {
    if (!currentStudent) return [];
    return payments
      .filter(
        (p) =>
          p.studentId === currentStudent.id ||
          p.admissionNumber.toLowerCase() === currentStudent.admissionNumber.toLowerCase()
      )
      .sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());
  }, [payments, currentStudent]);

  // Running balance calculation
  const paymentLedgerWithBalance = useMemo(() => {
    if (!currentStudent) return [];
    let runningBalance = currentStudent.totalFeesBilled;

    return studentPayments.map((p) => {
      runningBalance = Math.max(0, runningBalance - p.amount);
      return {
        ...p,
        runningBalance
      };
    });
  }, [currentStudent, studentPayments]);

  if (!isOpen || !currentStudent) return null;

  const isCleared = currentStudent.feeBalance === 0;
  const settlementPercent =
    currentStudent.totalFeesBilled > 0
      ? Math.min(100, Math.round((currentStudent.totalFeesPaid / currentStudent.totalFeesBilled) * 100))
      : 100;

  // Grade-specific fee itemization breakdown
  const getFeeBreakdown = (student: Student) => {
    const isSenior = student.grade.includes('11') || student.grade.includes('12');
    const billed = student.totalFeesBilled;

    if (isSenior) {
      return [
        {
          category: 'Core Instruction',
          item: 'Advanced Core Tuition & Specialized Subject Electives',
          amount: Math.round(billed * 0.58)
        },
        {
          category: 'Practicals & STEM',
          item: 'Senior Science & Engineering Lab Consumables',
          amount: Math.round(billed * 0.15)
        },
        {
          category: 'Academic Assessment',
          item: 'National Exam Preparation, Mock Papers & Testing',
          amount: Math.round(billed * 0.08)
        },
        {
          category: 'Digital Learning',
          item: 'Library, Research Journals & ICT Infrastructure',
          amount: Math.round(billed * 0.07)
        },
        {
          category: 'Co-Curricular',
          item: 'Sports, Clubs & Physical Education Facilities',
          amount: Math.round(billed * 0.05)
        },
        {
          category: 'Welfare & Nutrition',
          item: 'Daily Balanced Mid-Day Meals & Health Services',
          amount:
            billed -
            (Math.round(billed * 0.58) +
              Math.round(billed * 0.15) +
              Math.round(billed * 0.08) +
              Math.round(billed * 0.07) +
              Math.round(billed * 0.05))
        }
      ];
    }

    return [
      {
        category: 'Core Instruction',
        item: 'Tuition, Academic Instruction & Mentorship',
        amount: Math.round(billed * 0.56)
      },
      {
        category: 'Science & ICT',
        item: 'Science Laboratory & Computer Lab Consumables',
        amount: Math.round(billed * 0.14)
      },
      {
        category: 'Learning Resources',
        item: 'Library, Media Center & Digital Learning Portals',
        amount: Math.round(billed * 0.08)
      },
      {
        category: 'Co-Curricular',
        item: 'Swimming, Track & Field, Music & Clubs',
        amount: Math.round(billed * 0.08)
      },
      {
        category: 'Assessment',
        item: 'Mid-Term & End-Term Examination Printing & Reports',
        amount: Math.round(billed * 0.05)
      },
      {
        category: 'Welfare & Nutrition',
        item: 'Daily Mid-Day Nutrition & First Aid Medical Cover',
        amount:
          billed -
          (Math.round(billed * 0.56) +
            Math.round(billed * 0.14) +
            Math.round(billed * 0.08) +
            Math.round(billed * 0.08) +
            Math.round(billed * 0.05))
      }
    ];
  };

  const feeItems = getFeeBreakdown(currentStudent);

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Copy SMS / WhatsApp statement summary
  const handleCopySummary = () => {
    const text = `*PCEA ST. ANDREWS SCHOOL - FEE STATEMENT*
Learner: ${currentStudent.firstName} ${currentStudent.lastName}
Adm No: ${currentStudent.admissionNumber} (${currentStudent.grade})
Term: ${selectedTerm}
-----------------------------
Total Billed: KES ${currentStudent.totalFeesBilled.toLocaleString()}
Total Paid: KES ${currentStudent.totalFeesPaid.toLocaleString()}
Outstanding Arrears: KES ${currentStudent.feeBalance.toLocaleString()}
Status: ${isCleared ? 'CLEARED IN FULL' : 'PAYMENT DUE'}
-----------------------------
Pay via M-Pesa Paybill:
Business No: 400200
Account No: ${currentStudent.admissionNumber}
Or Bank: Absa Bank Kenya, A/C: 01020-948210-00`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Download standalone HTML statement
  const handleDownload = () => {
    const statementHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Fee_Statement_${currentStudent.admissionNumber}_${currentStudent.firstName}_${currentStudent.lastName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #0f172a; }
          .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: bold; margin: 0; }
          .subtitle { font-size: 12px; color: #475569; margin: 4px 0 0 0; }
          .badge { display: inline-block; padding: 4px 12px; background: #0f172a; color: white; border-radius: 9999px; font-size: 11px; font-weight: bold; margin-top: 8px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; font-size: 12px; }
          .meta-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; background: #f8fafc; }
          .meta-row { display: flex; justify-content: space-between; padding: 3px 0; }
          .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
          .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
          .card-val { font-size: 18px; font-weight: bold; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 24px; }
          th { background: #f1f5f9; text-align: left; padding: 8px 10px; border: 1px solid #cbd5e1; font-weight: 600; }
          td { padding: 8px 10px; border: 1px solid #cbd5e1; }
          .text-right { text-align: right; }
          .bank-info { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin-bottom: 24px; font-size: 12px; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; padding-top: 20px; }
          .sig-line { border-bottom: 1px solid #475569; margin-bottom: 6px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">PCEA ST. ANDREWS PREPARATORY & HIGH SCHOOL</h1>
          <p class="subtitle">State House Road, Nairobi • P.O. Box 41298 - 00100, Nairobi, Kenya • Tel: +254 20 272 3505</p>
          <div class="badge">OFFICIAL STUDENT FEE STATEMENT & FINANCIAL LEDGER</div>
        </div>

        <div class="meta-grid">
          <div class="meta-box">
            <strong>Learner Particulars</strong>
            <div class="meta-row"><span>Name:</span> <strong>${currentStudent.firstName} ${currentStudent.lastName}</strong></div>
            <div class="meta-row"><span>Admission No:</span> <strong>${currentStudent.admissionNumber}</strong></div>
            <div class="meta-row"><span>Class / Grade:</span> <span>${currentStudent.grade} (${currentStudent.stream})</span></div>
            <div class="meta-row"><span>Status:</span> <span>Active Enrolment</span></div>
          </div>
          <div class="meta-box">
            <strong>Billing & Guardian Contact</strong>
            <div class="meta-row"><span>Parent/Guardian:</span> <strong>${currentStudent.guardianName} (${currentStudent.guardianRelationship})</strong></div>
            <div class="meta-row"><span>Phone:</span> <span>${currentStudent.guardianPhone}</span></div>
            <div class="meta-row"><span>Email:</span> <span>${currentStudent.guardianEmail}</span></div>
            <div class="meta-row"><span>Address:</span> <span>${currentStudent.address}</span></div>
          </div>
        </div>

        <div class="summary-cards">
          <div class="card">
            <div style="font-size: 10px; color: #64748b; font-weight: bold;">TOTAL BILLED</div>
            <div class="card-val">KES ${currentStudent.totalFeesBilled.toLocaleString()}</div>
          </div>
          <div class="card">
            <div style="font-size: 10px; color: #64748b; font-weight: bold;">TOTAL PAID</div>
            <div class="card-val" style="color: #047857;">KES ${currentStudent.totalFeesPaid.toLocaleString()}</div>
          </div>
          <div class="card">
            <div style="font-size: 10px; color: #64748b; font-weight: bold;">OUTSTANDING BALANCE</div>
            <div class="card-val" style="color: ${isCleared ? '#047857' : '#b91c1c'};">KES ${currentStudent.feeBalance.toLocaleString()}</div>
          </div>
          <div class="card">
            <div style="font-size: 10px; color: #64748b; font-weight: bold;">STATUS</div>
            <div class="card-val" style="font-size: 14px; color: ${isCleared ? '#047857' : '#b45309'};">${isCleared ? 'CLEARED' : 'ARREARS DUE'}</div>
          </div>
        </div>

        <h3 style="font-size: 14px; margin-bottom: 8px;">Payment Transaction Ledger</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Receipt #</th>
              <th>Method</th>
              <th>Reference / Notes</th>
              <th class="text-right">Amount Paid</th>
              <th class="text-right">Running Balance</th>
            </tr>
          </thead>
          <tbody>
            ${
              paymentLedgerWithBalance.length > 0
                ? paymentLedgerWithBalance
                    .map(
                      (p) => `
              <tr>
                <td>${p.paymentDate}</td>
                <td><strong>${p.receiptNumber}</strong></td>
                <td>${p.paymentMethod}</td>
                <td>${p.notes || 'School fee payment'}</td>
                <td class="text-right" style="font-weight: bold; color: #047857;">KES ${p.amount.toLocaleString()}</td>
                <td class="text-right" style="font-weight: bold;">KES ${p.runningBalance.toLocaleString()}</td>
              </tr>
            `
                    )
                    .join('')
                : `<tr><td colspan="6" style="text-align: center; color: #64748b;">No payment transactions recorded to date.</td></tr>`
            }
          </tbody>
        </table>

        <div class="bank-info">
          <strong>Payment Remittance Details:</strong><br>
          M-Pesa Paybill: <strong>400200</strong> &bull; Account: <strong>${currentStudent.admissionNumber}</strong><br>
          Bank: <strong>Absa Bank Kenya, Nairobi Branch</strong> &bull; Account: <strong>01020-948210-00</strong>
        </div>

        <div class="signatures">
          <div>
            <div class="sig-line"></div>
            <div style="font-size: 11px; font-weight: bold;">Chief Bursar / Accounts Office</div>
            <div style="font-size: 10px; color: #64748b;">PCEA St. Andrews School</div>
          </div>
          <div style="text-align: right;">
            <div class="sig-line"></div>
            <div style="font-size: 11px; font-weight: bold;">Official School Verification Seal</div>
            <div style="font-size: 10px; color: #64748b;">Date: ${new Date().toLocaleDateString('en-GB')}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([statementHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Fee_Statement_${currentStudent.admissionNumber}_${currentStudent.lastName}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const statementReference = `STMT-2026-${currentStudent.admissionNumber.replace(/[^a-zA-Z0-9]/g, '')}-${currentStudent.stream.toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Outer Modal Container */}
      <div className="bg-slate-100 rounded-2xl max-w-4xl w-full my-auto shadow-2xl border border-slate-300 flex flex-col max-h-[94vh] overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none print:w-full print:max-w-none print:bg-white">
        {/* Top Control Bar (HIDDEN IN PRINT) */}
        <div className="bg-white px-5 py-3.5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 font-serif">
                  Student Fee Statement & Financial Ledger
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isCleared
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isCleared ? 'Cleared' : 'Arrears Pending'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Official statement summarizing individual student billing, payment history, and outstanding balance.
              </p>
            </div>
          </div>

          {/* Quick Learner Selector & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Student Dropdown */}
            <div className="relative">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} ({s.admissionNumber}) • {s.grade}
                  </option>
                ))}
              </select>
            </div>

            {/* Term Dropdown */}
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="text-xs font-medium px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
            >
              <option value="Term 1 - 2026">Term 1 - 2026</option>
              <option value="Term 2 - 2026">Term 2 - 2026</option>
              <option value="Full Academic Year 2026">Full Year 2026</option>
            </select>

            {/* Copy Summary Text Button */}
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer border border-slate-200"
              title="Copy SMS/WhatsApp summary to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Summary</span>
                </>
              )}
            </button>

            {/* Download Standalone HTML/PDF Statement */}
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer border border-slate-200"
              title="Download standalone statement file"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download</span>
            </button>

            {/* Primary Print / Save as PDF Button */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm shadow-orange-500/20 transition-all cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Canvas */}
        <div className="overflow-y-auto p-4 sm:p-6 bg-slate-200/60 print:bg-white print:p-0 print:overflow-visible">
          {/* A4-Proportioned Printable Sheet */}
          <div
            id="student-fee-statement-document"
            className="bg-white rounded-xl shadow-lg border border-slate-300/80 p-6 sm:p-10 space-y-6 max-w-3xl mx-auto print:shadow-none print:border print:border-slate-300 print:rounded-none print:p-6 print:m-0 print:max-w-none"
          >
            {/* 1. Institutional Letterhead Header */}
            <div className="border-b-2 border-slate-900 pb-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                {/* School Seal & Identity */}
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-white shadow-md border border-slate-700">
                    <Building2 className="w-8 h-8 text-orange-400" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif tracking-tight">
                      PCEA ST. ANDREWS ACADEMY
                    </h1>
                    <p className="text-[11px] font-medium text-slate-600 italic">
                      Kindergarten, Preparatory & Senior High School Campus
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      State House Road • P.O. Box 41298 - 00100, Nairobi, Kenya • Tel: +254 (020) 272-3505
                    </p>
                  </div>
                </div>

                {/* Statement Reference & Meta */}
                <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 w-full sm:w-auto">
                  <span className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-md">
                    OFFICIAL FEE STATEMENT
                  </span>
                  <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                    <div>
                      <span className="text-slate-400">Statement Ref: </span>
                      <span className="font-mono font-bold text-slate-800">{statementReference}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Date of Issue: </span>
                      <span className="font-semibold text-slate-800">
                        {new Date().toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Academic Period: </span>
                      <span className="font-semibold text-slate-800">{selectedTerm}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Learner & Account Particulars (Two Column Card) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Learner Particulars */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                  <User className="w-3.5 h-3.5 text-orange-500" />
                  <span>Learner Particulars</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Student Full Name:</span>
                  <span className="font-bold text-slate-900">
                    {currentStudent.firstName} {currentStudent.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Admission Number:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {currentStudent.admissionNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Class & Stream:</span>
                  <span className="font-semibold text-slate-800">
                    {currentStudent.grade} ({currentStudent.stream})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Enrolment Status:</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Active & In Session
                  </span>
                </div>
              </div>

              {/* Billing & Guardian Particulars */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200">
                  <Building2 className="w-3.5 h-3.5 text-orange-500" />
                  <span>Guardian & Billing Particulars</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Parent / Guardian:</span>
                  <span className="font-bold text-slate-900">
                    {currentStudent.guardianName} ({currentStudent.guardianRelationship})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Telephone:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {currentStudent.guardianPhone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Billing Email:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[180px]">
                    {currentStudent.guardianEmail}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Physical Address:</span>
                  <span className="text-slate-800 font-medium truncate max-w-[180px]">
                    {currentStudent.address}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Executive Financial Standing Snapshot */}
            <div className="border border-slate-200 rounded-xl p-4 bg-gradient-to-br from-slate-50/80 to-white">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Executive Account Status Summary
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                {/* Total Billed */}
                <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Total Invoiced
                  </span>
                  <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                    KES {currentStudent.totalFeesBilled.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400">Approved term package</span>
                </div>

                {/* Total Paid */}
                <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Total Credited
                  </span>
                  <div className="text-base sm:text-lg font-black text-emerald-700 mt-0.5">
                    KES {currentStudent.totalFeesPaid.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    {settlementPercent}% settled
                  </span>
                </div>

                {/* Outstanding Balance */}
                <div
                  className={`p-3 rounded-lg border shadow-2xs ${
                    isCleared
                      ? 'bg-emerald-50/80 border-emerald-200'
                      : 'bg-rose-50/80 border-rose-200'
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider block ${
                      isCleared ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    Outstanding Arrears
                  </span>
                  <div
                    className={`text-base sm:text-lg font-black mt-0.5 ${
                      isCleared ? 'text-emerald-800' : 'text-rose-800'
                    }`}
                  >
                    KES {currentStudent.feeBalance.toLocaleString()}
                  </div>
                  <span
                    className={`text-[10px] font-semibold ${
                      isCleared ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {isCleared ? 'Zero balance' : 'Payable immediately'}
                  </span>
                </div>

                {/* Clearance Status */}
                <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Exam Clearance
                  </span>
                  <div className="mt-1">
                    {isCleared ? (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>CLEARANCE PASS</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>PENDING ARREARS</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {isCleared ? 'Approved for assessments' : 'Due by mid-term deadline'}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center gap-3">
                <div className="text-[11px] font-semibold text-slate-600 shrink-0">
                  Settlement Progress:
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isCleared ? 'bg-emerald-600' : 'bg-orange-500'
                    }`}
                    style={{ width: `${settlementPercent}%` }}
                  ></div>
                </div>
                <div className="text-xs font-bold text-slate-800 shrink-0">
                  {settlementPercent}%
                </div>
              </div>
            </div>

            {/* 4. Itemized Fee Structure Assessment Schedule */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Itemized Fee Invoice Schedule
                </h3>
                <span className="text-[11px] text-slate-500">Standard Grade Fee Structure</span>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Item #</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3">Billing Item Description</th>
                      <th className="py-2 px-3 text-right">Invoiced Amount (KES)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {feeItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-slate-700">{item.category}</td>
                        <td className="py-2 px-3 text-slate-800">{item.item}</td>
                        <td className="py-2 px-3 text-right font-medium text-slate-900">
                          {item.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300 text-xs">
                    <tr>
                      <td colSpan={3} className="py-2.5 px-3 text-slate-800 text-right uppercase">
                        Total Invoiced Term Fees:
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900 text-sm">
                        KES {currentStudent.totalFeesBilled.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* 5. Historical Payment Transaction Ledger (CORE USER REQUIREMENT) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-orange-500" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Payment History & Credit Ledger
                  </h3>
                </div>
                <span className="text-[11px] font-medium text-slate-500">
                  {studentPayments.length} verified transaction{studentPayments.length !== 1 ? 's' : ''}
                </span>
              </div>

              {studentPayments.length > 0 ? (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-bold text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Receipt No.</th>
                        <th className="py-2 px-3">Payment Channel</th>
                        <th className="py-2 px-3">Transaction Remarks</th>
                        <th className="py-2 px-3 text-right">Amount Paid</th>
                        <th className="py-2 px-3 text-right">Running Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paymentLedgerWithBalance.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                            {p.paymentDate}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-indigo-700 text-[11px]">
                            {p.receiptNumber}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                              {p.paymentMethod}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 text-[11px]">
                            {p.notes || 'School fee installment'}
                            <span className="block text-[10px] text-slate-400">
                              By: {p.recordedBy}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-700">
                            + KES {p.amount.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            KES {p.runningBalance.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300 text-xs">
                      <tr>
                        <td colSpan={4} className="py-2.5 px-3 text-slate-800 text-right uppercase">
                          Total Payments Credited:
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-emerald-700 text-sm">
                          KES {currentStudent.totalFeesPaid.toLocaleString()}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-black text-sm ${
                            isCleared ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          KES {currentStudent.feeBalance.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-500">
                  <p className="font-medium text-slate-700">No payments recorded to date for this student.</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    The entire billed invoice amount of KES {currentStudent.totalFeesBilled.toLocaleString()} remains outstanding.
                  </p>
                  {onRecordPayment && (
                    <button
                      onClick={() => {
                        onRecordPayment(currentStudent.id);
                        onClose();
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 text-white font-bold text-xs shadow-xs hover:bg-orange-600 transition-colors cursor-pointer"
                    >
                      <span>+ Record Initial Payment Now</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 6. Outstanding Balance & Remittance Instructions */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-200">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Payment Remittance Instructions
                </span>
                <span className="text-[11px] text-slate-500">
                  Official School Bank Accounts & Mobile Money Channels
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* M-Pesa Channel */}
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    Safaricom M-Pesa (Direct Clearance)
                  </div>
                  <div className="mt-1.5 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Paybill Business No:</span>
                      <span className="font-mono font-black text-slate-900">400200</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account No (Student Adm):</span>
                      <span className="font-mono font-black text-orange-600">
                        {currentStudent.admissionNumber}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bank Wire Channel */}
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    Bank Wire / Electronic Funds Transfer (EFT)
                  </div>
                  <div className="mt-1.5 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bank & Branch:</span>
                      <span className="font-semibold text-slate-900">Absa Bank Kenya, Nairobi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account Number:</span>
                      <span className="font-mono font-black text-slate-900">01020-948210-00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account Name:</span>
                      <span className="font-medium text-slate-800">PCEA St. Andrews School Account</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 italic pt-1">
                Notice: Always quote the student admission number ({currentStudent.admissionNumber}) as payment reference to ensure immediate automatic ledger clearance.
              </p>
            </div>

            {/* 7. Official Endorsement & Verification Footer */}
            <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-serif">
              {/* Bursar Signature */}
              <div className="space-y-1">
                <div className="h-10 border-b border-slate-400 flex items-end pb-1 font-sans italic text-slate-600 text-[11px]">
                  Arthur Pendelton, Ph.D.
                </div>
                <div className="font-sans font-bold text-slate-800 text-[11px]">
                  Head of Accounts & Finance
                </div>
                <div className="font-sans text-[10px] text-slate-400">PCEA St. Andrews Bursary</div>
              </div>

              {/* Headteacher Endorsement */}
              <div className="space-y-1">
                <div className="h-10 border-b border-slate-400 flex items-end pb-1 font-sans italic text-slate-600 text-[11px]">
                  Sarah Jenkins, M.Ed.
                </div>
                <div className="font-sans font-bold text-slate-800 text-[11px]">
                  School Principal / Administrator
                </div>
                <div className="font-sans text-[10px] text-slate-400">PCEA St. Andrews Campus</div>
              </div>

              {/* Official Seal / Verification */}
              <div className="flex flex-col items-center sm:items-end justify-center text-center sm:text-right font-sans">
                <div className="w-24 h-12 border border-slate-300 rounded-lg flex items-center justify-center bg-slate-50 text-[10px] text-slate-400 font-mono">
                  [ OFFICIAL STAMP ]
                </div>
                <span className="text-[9px] text-slate-400 mt-1">
                  ERP Certified &bull; {new Date().toLocaleDateString('en-GB')}
                </span>
              </div>
            </div>

            {/* Tiny Legal / Security Footer */}
            <div className="pt-2 text-[9px] text-slate-400 font-mono text-center border-t border-slate-200">
              PCEA St. Andrews Integrated ERP System &bull; Confidential Student Accounting Record &bull; Generated electronically &bull; Page 1 of 1
            </div>
          </div>
        </div>

        {/* Modal Footer Actions (HIDDEN IN PRINT) */}
        <div className="bg-white px-5 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="text-xs text-slate-500">
            Current Standing: <span className="font-bold text-slate-800">{currentStudent.firstName} {currentStudent.lastName}</span> &bull;{' '}
            {isCleared ? (
              <span className="text-emerald-700 font-bold">Cleared (0.00 balance)</span>
            ) : (
              <span className="text-rose-700 font-bold">
                KES {currentStudent.feeBalance.toLocaleString()} Outstanding
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isCleared && onRecordPayment && (
              <button
                onClick={() => {
                  onRecordPayment(currentStudent.id);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold transition-colors cursor-pointer"
              >
                + Record Payment for {currentStudent.firstName}
              </button>
            )}

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-orange-400" />
              <span>Print Statement</span>
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
